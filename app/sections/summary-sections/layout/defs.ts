interface BoxData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PaddingData {
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

// This should be moved to link overlay code
interface SectionPositionData extends BoxData, PaddingData {
  id: string;
  // Needs to be completed
  [rest: string]: any;
}

export interface SectionPositions {
  [id: string]: SectionPositionData;
}
