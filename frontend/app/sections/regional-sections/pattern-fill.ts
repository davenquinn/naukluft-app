import h from "@macrostrat/hyper";
import { GeologicPattern } from "@macrostrat/column-components";
import { createContext, useContext } from "react";

const PatternPrefixContext = createContext<string>("pattern");

const FaciesPattern = (props) => {
  const prefix = useContext(PatternPrefixContext);
  const { facies, id, size, ...rest } = props;
  return h(GeologicPattern, {
    id,
    prefix,
    name: facies,
    width: size,
    height: size,
    shapeRendering: "crispEdges",
    ...rest,
  });
};
FaciesPattern.defaultProps = { size: 100 };

const grainstoneColors = {
  color: "#403ab8",
  backgroundColor: "#7d83bd",
};

const FillPatternDefs = (props) => {
  const { prefix, invert } = props;

  return h(PatternPrefixContext.Provider, { value: prefix }, [
    h("defs", [
      h(FaciesPattern, {
        facies: "rework",
        id: "216-DO",
        //patternTransform: "rotate(90)",
        backgroundColor: "#fcdede",
        color: "#e07171",
        size: 30,
      }),

      h(FaciesPattern, {
        facies: "p",
        id: "232-DO",
        //patternTransform: "rotate(90)",
        backgroundColor: "#deeffc",
        color: "#96c5eb",
        size: 30,
      }),
      h(FaciesPattern, {
        facies: "sub",
        id: "230-DO",
        patternTransform: "rotate(90)",
        backgroundColor: "#deeffc",
        color: "#96c5eb",
      }),
      h(FaciesPattern, {
        facies: "sh",
        id: "114-DO",
        ...grainstoneColors,
      }),
      h(FaciesPattern, {
        facies: "or",
        id: "105-DO",
        size: 60,
        ...grainstoneColors,
      }),
      h(FaciesPattern, {
        facies: "mc",
        id: "431-DO",
        patternTransform: "rotate(60)",
        backgroundColor: "#dee3fc",
        color: "#7d7dbd",
      }),
      h(FaciesPattern, {
        facies: "cc",
        id: "121-DO",
        size: 50,
        color: "#22958a",
        backgroundColor: "#70c7bf",
      }),
      h(FaciesPattern, {
        facies: "pc",
        id: "121-DO",
        size: 50,
        color: "#4eb6ac",
        backgroundColor: "#dcedc9",
      }),
      h(FaciesPattern, {
        facies: "fc",
        id: "230-DO",
        patternTransform: "rotate(90)",
        backgroundColor: "#f1f5eb",
        color: "#dcedc9",
      }),
    ]),
  ]);
};

export { FillPatternDefs };
