export interface SectionImage {
  filename: string,
  width: number,
  height: number
}

export interface SectionData {
  end: number,
  clip_end: number,
  height: number,
  start: number,
  range: [number, number],
  location: string,
  imageFiles?: SectionImage[],
  scaleFactor: number,
  offset: number,
  section: string
}

interface BoxData {
  x: number,
  y: number,
  width: number,
  height: number
}

interface PaddingData {
  paddingLeft: number?,
  paddingRight: number?,
  paddingTop: number?,
  paddingBottom: number?
}

// This should be moved to link overlay code
interface SectionPositionData extends BoxData, PaddingData {
  id: string,
  // Needs to be completed
  [rest: string]: any
}

export interface SectionPositions {
  [id: string]: SectionPositionData
}
