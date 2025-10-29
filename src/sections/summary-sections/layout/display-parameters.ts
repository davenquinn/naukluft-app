/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Colors } from "@blueprintjs/core";

const tectonicSectionOffsets = {
  A: 0,
  B: 105,
  C: 270,
  D: 415,
  E: 255,
  F: 268,
  G: 0,
  H: 378,
  I: 50,
  J: -5,
};

// A more stratigraphically focused set of section offsets
// (shows progradation downdip)
const sectionOffsets = {
  A: -280,
  B: -50,
  C: 50,
  D: 200,
  E: 70,
  F: 200,
  G: -10,
  H: 310,
  I: 30,
  J: -5,
  M: 180,
  K: 530,
};

const sectionIsotopeColors = {
  J: Colors.BLUE3,
  M: Colors.TURQUOISE3,
  A: Colors.VIOLET2,
  B: Colors.INDIGO2,
  C: Colors.VIOLET4,
  D: Colors.ROSE3,
  E: Colors.INDIGO4,
  F: Colors.FOREST4,
  G: Colors.LIME4,
  H: Colors.FOREST2,
  I: Colors.ROSE4,
  K: Colors.GRAY3,
};

const groupOffsets = {
  Tsams: 200,
  Onis: -20,
  Ubisis: 310,
};

const groupOrder = ["Onis", "Naukluft", "Ubisis", "Tsams", "Büllsport"];

const stackGroups = ["BD", "E", "AC", "HG", "IF"];

const sectionIsotopeScheme = (key, i) =>
  sectionIsotopeColors[key] || Colors.GRAY3;

export {
  stackGroups,
  groupOrder,
  sectionOffsets,
  groupOffsets,
  tectonicSectionOffsets,
  sectionIsotopeScheme,
};
