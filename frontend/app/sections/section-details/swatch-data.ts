export interface SwatchData {
  id: string;
  sectionID: string;
  range: [number, number];
}

interface SequenceSwatchData {
  [id: string]: SwatchData[];
}

export const sectionSwatches: SequenceSwatchData = {
  s1: [
    {
      id: "A",
      sectionID: "J",
      range: [45, 60]
    },
    {
      id: "B",
      sectionID: "B",
      range: [38, 53]
    },
    {
      id: "C",
      sectionID: "J",
      range: [145, 160]
    }
  ],
  s2: [
    {
      id: "D",
      sectionID: "F",
      range: [2, 22]
    },
    {
      id: "E",
      sectionID: "J",
      range: [298, 318]
    },
    {
      id: "F",
      sectionID: "J",
      range: [322.5, 342.5]
    }
  ],
  s3: [
    {
      id: "G",
      sectionID: "J",
      range: [472, 492]
    },
    {
      id: "H",
      sectionID: "J",
      range: [642, 662]
    }
  ]
};
