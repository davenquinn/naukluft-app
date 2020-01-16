/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const withinDomain = function(scale, height){
  const d = scale.domain();
  return d[0] < height < d[1];
};

const surfacesBuilder = props => (function(stackedSections) {
  const {sectionSurfaces, sectionIndex} = props;
  const surfacesIndex = {};
  // Logic for determining which section's surface is rendered
  // within a stack (typically the section that is not inferred)

  for (const section of stackedSections) {
    const {id: section_id} = section;
    const section_surfaces = sectionSurfaces[section_id] || [];
    // Define a function to return domain
    const {globalScale} = sectionIndex[section_id]

    // Naive logic
    for (const surface of section_surfaces) {
      // Get an already existing entry for this surface in the column stack
      const prevEntry = surfacesIndex[surface.surface_id];
      if (prevEntry != null) {
        /*
        We already have a surface defined, so now we need to decide whether
        to override it...
        */
        // This logic kinda sucks
        const prevInDomain = withinDomain(globalScale, prevEntry.height);
        //const poorer = prevInDomain && prevEntry.inferred && !section.inferred
        if (prevInDomain) continue;
        if (!withinDomain(globalScale, surface.height)) continue;
      }
      surfacesIndex[surface.surface_id] = {section: section_id, ...surface};
    }
  }
  // Convert to an array
  const surfacesArray = Object.values(surfacesIndex);

  // Add the pixel height
  for (const surface of Array.from(surfacesArray)) {
    const {globalScale} = sectionIndex[surface.section];
    surface.y = globalScale(surface.height);
    surface.inDomain = withinDomain(globalScale, surface.height);
  }
  return surfacesArray;
});

export {surfacesBuilder}
