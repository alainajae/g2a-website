﻿import React, { Component, useState } from "react";
import * as d3 from "d3";
import "antd/dist/antd.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import geoData from "./../../data/geoData.json";
import contentText from "./../../data/merge_data_allegheny_map.json";
import { icon } from "leaflet";
import Legend from "./Legend";

class MapComponent extends Component {
  constructor() {
    super();
    this.state = {
      position: [40.446, -79.9633],
      lastSelectedLocation: "nowhere",
      lastSelectedLocationColor: null,
      lastSelectedTermLocationColor: [],
      map: null,
      isFrequencySelected: false,
    };

    this.eachArea = this.eachArea.bind(this);
    this.highlightLayers = this.highlightRegion.bind(this);
    this.getText = this.getText.bind(this);
    this.highlightRegion = this.highlightRegion.bind(this);
  }

  componentDidMount() {
  }

  // Built-In Method
  componentDidUpdate(prevProps) {
    if (prevProps.center !== this.props.center) {
      var last_color;
      if (
        d3.select("." + this.props.center.split(" ").join("_"))
          ._groups[0][0] !== null
      ) {
        last_color = d3
          .select("." + this.props.center.split(" ").join("_"))
          .style("fill");
      }
      console.log(d3.select("." + this.props.center.split(" ").join("_")));
      d3.select("." + this.props.center.split(" ").join("_"))
        .style("fill", "red")
        .style("fill-opacity", 0.6);
      var opa = 0.2;
      if (this.state.lastSelectedLocationColor == "blue") {
        opa = 0.6;
      }
      d3.select("." + this.state.lastSelectedLocation.split(" ").join("_"))
        .style("fill", this.state.lastSelectedLocationColor)
        .style("fill-opacity", opa);
      this.setState({
        lastSelectedLocation: this.props.center,
        lastSelectedLocationColor: last_color,
      });
    }

    // Color in selected regions which have selected keyword
    // prevProps could either be empty or a different set of regions
    if (prevProps.keywordRegions !== this.props.keywordRegions) {
      console.log("Made into exterior loop!");

      // If prevProps was not empty (null)
      if (prevProps.keywordRegions != null) {
        var t = -1;
        prevProps.keywordRegions.forEach((r) => {
          t++;
          const selectedRegion = d3.select(
            "." +
              r
                .replace(")", "")
                .replace("(", "")
                .replace("/", "")
                .split(" ")
                .join("_")
          );
          if (!selectedRegion.empty()) {
            d3.select("." + r.split(" ").join("_"))
              .style("fill", "blue")
              .style("fill-opacity", 0.2);
          }
        });
      }else{
        console.log("previous keyword regions were empty");
      }

      
      var lastSelectedTermLocationColor = [];
      // Error is somewhere in here
      this.props.keywordRegions.forEach((r) => {
        const selectedMuni = d3.select("." + r.split(" ").join("_"));
        console.log(selectedMuni)

        lastSelectedTermLocationColor = [
          ...lastSelectedTermLocationColor,
          /*
          d3.select("." + r.split(" ").join("_"))
            .style("fill"),
          */
         "blue",
        ];
        const selectedRegion = d3.select(
          "." +
            r
              .replace(")", "")
              .replace("(", "")
              .replace("/", "")
              .split(" ")
              .join("_")
        );
        if (!selectedRegion.empty()) {
          d3.select("." + r.split(" ").join("_"))
            .style("fill", "blue")
            .style("fill-opacity", 0.6);
        }
      });
      this.setState({
        lastSelectedTermLocationColor: lastSelectedTermLocationColor,
        isFrequencySelected: true,
      });
      }

    if (this.props.clearMap && prevProps.keywordRegions != null) {
      var t = -1;
      prevProps.keywordRegions.forEach((r) => {
        t++;
        const selectedRegion = d3.select(
          "." +
            r
              .replace(")", "")
              .replace("(", "")
              .replace("/", "")
              .split(" ")
              .join("_")
        );
        if (!selectedRegion.empty()) {
          d3.select("." + r.split(" ").join("_"))
            .style("fill", this.state.lastSelectedTermLocationColor[t])
            .style("fill-opacity", 0.2);
        }
      });
    }
  }

  highlightRegion(e) {
    const selectedRegion = e.target.options.className.split("_").join(" ");
    this.props.onSelectedRegion(selectedRegion);
  }

  eachArea(feature, layer) {
    const areaName = feature.properties.LABEL;
    const groupName = feature.properties.REGION;
    layer.bindPopup(this.getText(areaName));
    layer.options.color = "black";
      groupName === "MV" ? layer.options.fillColor = "red" :
          groupName === "NH" ? layer.options.fillColor = "yellow" :
              groupName === "SH" ? layer.options.fillColor = "orange" :
                  groupName === "ES" ? layer.options.fillColor = "green" :
                      groupName === "AA" ? layer.options.fillColor = "purple" :
                          groupName === "PGH" ? layer.options.fillColor = "black" : none = 1;
    layer.setStyle({ className: areaName.split(" ").join("_") });

    layer.on({
      click: this.highlightRegion,
    });
  }

  getContent(content) {
    if (content === null || content == "NA" || content == "" || content == "none") {
      return "No info";
    } else {
      return content;
    }
  }

    getText(center) {
        var id;
        for (var i in this.props.locations) {
            if (this.props.locations[i].name == center) {
                id = this.props.locations[i].id;
                break
            }
        }

        var t = 0;
        var length = contentText.length;
        while (t < length) {
          // Municipality_Served is the name of the municipality, wi
            if (contentText[t]['Municipality_Served'] === center) {
                var link_string
                if (
                    contentText[t]['Police_Department_Website'] == "" ||
                    contentText[t]['Police_Department_Website'] == null ||
                    contentText[t]['Police_Department_Website'] == "NA"
                ) {
                    link_string = "<br>" +
                        "<br >No link for police department</br>"
                }
                else {
                    link_string = "<br>" +
                        "<a  href=" +
                        contentText[t]['Police_Department_Website'] +
                        " target='_blank'>Link to police department website</a><br>"
                }
                var contract_link = "<br><a  href=/PxPUC/#/location/" +
                    id +
                    " target='_blank'>Link to contract detail page</a>"
                if (id == null) {
                    contract_link = "<br>No link for contract"
                }
                var police_number = String(this.getContent(
                    contentText[t]['2019_Full_Time_Police']
                ))
                var text = ""
                text = text.concat(contentText[t]['Municipality_Served'] +
                    link_string)
                text = text.concat( "Full time police officers as of 2019: ")
                text = text.concat(String(police_number))
                text = text.concat("<br> Police bill of rights: " +
                    this.getContent(
                        contentText[t]['police_bill_of_rights']
                    ) +
                    "<br> Police budget percentage 2019: " +
                    ((this.getContent(contentText[t]['2019_Police_Budget_Percentage']) !== 'null') ? this.getContent(contentText[t]['2019_Police_Budget_Percentage']) : "No info") +
                    "<br> <br> Keywords in contract: " +
                    this.getContent(contentText[t]['Keywords_found_in_contract']) +
                    contract_link)
                return (
                     text
                );
            }
            t++;
        }

        return "No data for " + String(center);
    }

  render() {
    const { position } = this.state;
    const iconFile = icon({
      iconUrl: "https://z3.ax1x.com/2021/10/21/5rZ6c6.png",
    });
    if (this.props.locations.length == 0)
      return <div></div> 
    else
      return (
        <>
          <div
            className="map_container leaflet-container leaflet-touch leaflet-retina leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom"
            style={{ height: 500 }}
          >
            <MapContainer
              center={position}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: 500 }}
              whenCreated={(map) => {
                this.setState({ map: map });
              }}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="http://cartodb.com/attributions">CartoDB</a> attributions <a href = "mailto: gishelp@alleghenycounty.us">GIS Help</a> Legend credit'
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
              />
              <GeoJSON data={geoData.features} onEachFeature={this.eachArea} />
              <Marker position={this.props.pos} icon={iconFile}>
                <Tooltip interactive={true} permanent>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: this.getText(this.props.center),
                    }}
                  />
                </Tooltip>
              </Marker>
              <Legend map={this.state.map} />
            </MapContainer>
          </div>
        </>
      );
  }
}

export default MapComponent;
