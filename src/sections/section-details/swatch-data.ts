export interface SwatchData {
  id: string;
  sectionID: string;
  range: [number, number];
  label?: string;
}

interface SequenceSwatchData {
  [id: string]: SwatchData[];
}

export const sectionSwatches: SequenceSwatchData = {
  tectonics_paper: [
    {
      id: "A",
      sectionID: "J",
      range: [140, 160],
      label: "Fig. 10a",
    },
    {
      id: "B",
      sectionID: "J",
      range: [295, 315],
      label: "Fig. 10b",
    },
  ],
  dz: [
    {
      id: "B",
      sectionID: "J",
      range: [78, 98],
    },
    {
      id: "C",
      sectionID: "J",
      range: [140, 160],
    },
    {
      id: "G",
      sectionID: "J",
      range: [295, 315],
    },
  ],
  "dz-all": [
    {
      id: "B",
      sectionID: "J",
      range: [85, 95],
    },
    {
      id: "C",
      sectionID: "J",
      range: [145, 160],
    },
    {
      id: "G",
      sectionID: "J",
      range: [298, 304],
    },
    {
      id: "G",
      sectionID: "F",
      range: [80, 105],
    },
    {
      id: "H",
      sectionID: "M",
      range: [0, 25],
    },
    {
      id: "H",
      sectionID: "K",
      range: [0, 20],
    },
  ],
  s1: [
    {
      id: "A",
      sectionID: "J",
      range: [45, 60],
    },
    {
      id: "B",
      sectionID: "B",
      range: [38, 53],
    },
    {
      id: "C",
      sectionID: "J",
      range: [145, 160],
    },
  ],
  s2: [
    {
      id: "D",
      sectionID: "F",
      range: [2, 22],
    },
    {
      id: "E",
      sectionID: "J",
      range: [298, 318],
    },
    {
      id: "F",
      sectionID: "J",
      range: [322.5, 342.5],
    },
  ],
  s3: [
    {
      id: "G",
      sectionID: "J",
      range: [472, 492],
    },
    {
      id: "H",
      sectionID: "J",
      range: [642, 662],
    },
  ],
};
