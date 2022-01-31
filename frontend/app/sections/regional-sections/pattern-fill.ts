import h from "@macrostrat/hyper";
import { GeologicPattern, PatternType } from "@macrostrat/column-components";
import { createContext, useContext } from "react";

const PatternPrefixContext = createContext<string>("pattern");

const FaciesPattern = props => {
  const prefix = useContext(PatternPrefixContext);
  let { facies, id, size, ...rest } = props;
  //id = id?.replace(/-K$/, "-DO");
  return h(GeologicPattern, {
    id,
    prefix,
    name: facies,
    width: size,
    height: size,
    type: PatternType.Raster,
    ...rest
  });
};
FaciesPattern.defaultProps = { size: 100 };

const grainstoneColors = {
  color: "#403ab8",
  backgroundColor: "#7d83bd"
};

const FillPatternDefs = props => {
  const { prefix, invert } = props;

  return h(PatternPrefixContext.Provider, { value: prefix }, [
    h("defs", [
      h(FaciesPattern, {
        facies: "rework",
        //id: "216-DO",
        //patternTransform: "rotate(90)",
        //backgroundColor: "#e2671e"//"#fcdede",
        color: "#ff7701", //"#e07171",
        size: 30
      }),

      h(FaciesPattern, {
        facies: "p",
        //id: "406-DO",
        //patternTransform: "rotate(90)",
        //backgroundColor: "#deeffc",
        color: "#b3d2fe", //"#96c5eb",
        size: 80
      }),
      h(FaciesPattern, {
        facies: "sub",
        id: "230-K",
        patternTransform: "rotate(90)",
        backgroundColor: "#b3d2fe",
        color: "#7799B3"
      }),
      h(FaciesPattern, {
        facies: "sh",
        //id: "114-DO",
        //size: 120,
        //...grainstoneColors
        backgroundColor: grainstoneColors.backgroundColor
      }),
      h(FaciesPattern, {
        facies: "or",
        id: "416-K",
        size: 30,
        ...grainstoneColors,
        color: "#3a34b9"
        //backgroundColor: "#71749b"
        //color: grainstoneColors.backgroundColor
      }),
      h(FaciesPattern, {
        facies: "mc",
        id: "431-K",
        patternTransform: "rotate(60)",
        //...grainstoneColors,
        backgroundColor: "#bbc0fb", // "#71749b", //"#6e7396",
        color: "#a9accb" //"#3a34b9"
        //color: "#686B8E" // "#6a6d8f" //"#7d7dbd"
      }),
      h(FaciesPattern, {
        facies: "cc",
        id: "121-K",
        size: 50,
        color: "#22958a",
        backgroundColor: "#70c7bf"
      }),
      h(FaciesPattern, {
        facies: "pc",
        id: "121-K",
        size: 50,
        color: "#4eb6ac",
        backgroundColor: "#dcedc9"
      }),
      h(FaciesPattern, {
        facies: "fc",
        id: "230-K",
        patternTransform: "rotate(90)",
        backgroundColor: "#f1f5eb",
        color: "#dcedc9"
      })
    ])
  ]);
};

export { FillPatternDefs };
