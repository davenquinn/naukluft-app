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
  return d[0] < height && height < d[1];
};

const surfacesBuilder = props => (function(stackedSections) {
  let globalScale, section, surface;
  const {sectionSurfaces, sectionIndex} = props;
  const surfacesIndex = {};
  // Logic for determining which section's surface is rendered
  // within a stack (typically the section that is not inferred)

  for (section of Array.from(stackedSections)) {
    const {id: section_id} = section;
    const section_surfaces = sectionSurfaces[section_id] || [];
    // Define a function to return domain
    ({globalScale} = sectionIndex[section_id]);

    // Naive logic
    for (surface of Array.from(section_surfaces)) {
      const s1 = surfacesIndex[surface.surface_id];
      if (s1 != null) {
        // We already have a surface defined
        if (withinDomain(globalScale, s1.height)) {
          if (s1.inferred && !section.inferred) {
            continue;
          }
        }
        if (!withinDomain(globalScale, surface.height)) {
          continue;
        }
      }
      surfacesIndex[surface.surface_id] = {section: section_id, ...surface};
    }
  }
  // Convert to an array
  const surfacesArray = ((() => {
    const result = [];
    for (let k in surfacesIndex) {
      const v = surfacesIndex[k];
      result.push(v);
    }
    return result;
  })());
  // Add the pixel height
  for (surface of Array.from(surfacesArray)) {
    ({globalScale} = sectionIndex[surface.section]);
    surface.y = globalScale(surface.height);
    surface.inDomain = withinDomain(globalScale, surface.height);
  }
  return surfacesArray;
});

export {surfacesBuilder}
