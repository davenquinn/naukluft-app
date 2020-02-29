declare interface SectionImage {
  filename: string,
  width: number,
  height: number
}

declare interface SectionData {
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
