import {group} from 'd3-array'
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
        const poorer = prevInDomain && prevEntry.inferred && !section.inferred
        if (poorer) continue;
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

const prepareLinkData = function(props){
  const {surfaces, sectionIndex} = props;
  if (!surfaces.length) return null;

  //# Deconflict surfaces
  //# The below is a fairly complex way to make sure multiple surfaces
  //# aren't connected in the same stack.
  // Should probably do this with a group by
  const sectionSurfaces = {};
  for (const {surface_id, section_height} of surfaces) {
    if (surface_id == null) continue; // weed out lithostratigraphy for now
    for (let {section, ...rest} of section_height) {
      if (sectionSurfaces[section] == null) { sectionSurfaces[section] = []; }
      sectionSurfaces[section].push({surface_id, ...rest});
    }
  }

  // Backdoor way to get section stacks (group by column x position)
  const sectionStacks = group(Object.values(sectionIndex), d => d.x);

  const buildSectionStack = surfacesBuilder({sectionSurfaces, sectionIndex});

  //# Build up stacked sections
  const stackSurfaces = Array.from(sectionStacks, ([x, stackedSections])=>{
    const values = buildSectionStack(stackedSections);
    // Save generated index to appropriate stack
    return {x,values};
  });

  // Turn back into surface-oriented list
  return surfaces.map(s =>{
    if (s.surface_id == null) return s;
    const v = {
      ...s,
      section_heights: []
    };

    for (const {values} of stackSurfaces) {
      const val = values.find(d => s.surface_id == d.surface_id)
      if (val != null) v.section_heights.push(val)
    }
    return v;
  });
};

export {prepareLinkData}
