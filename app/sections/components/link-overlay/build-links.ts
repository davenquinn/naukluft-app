import {group, ascending} from 'd3-array'

const withinDomain = function(scale, height){
  const d = scale.domain();
  return d[0] < height && height < d[1];
};

const surfacesBuilder = props => (function(stackedSections) {
  const {sectionSurfaces, sectionIndex} = props;
  const surfacesIndex = {};
  // Logic for determining which section's surface is rendered
  // within a stack (typically the section that is not inferred)

  for (const section of stackedSections) {
    const {id: section_id} = section;
    const section_surfaces = sectionSurfaces[section_id] ?? [];
    // Define a function to return domain
    const {globalScale} = sectionIndex[section_id]

    for (const surface of section_surfaces) {
      surfacesIndex[surface.surface_id] = surfacesIndex[surface.surface_id] ?? [];
      // Get an already existing entry for this surface in the column stack
      surfacesIndex[surface.surface_id].push({
        section: section_id,
        inDomain: withinDomain(globalScale, surface.height),
        y: globalScale(surface.height),
        ...surface
      });
    }
  }

  /* Get the "best" section in the stack for which to display
     the surface. Best is defined as
     - 1st section that has surface within the domain
  */
  return Object.values(surfacesIndex).map(v=> {
    if (v.length == 1) {
      return v[0]
    } else {
      return v.find(d => d.inDomain) ?? v[0]
    }
  });
});

const sameSurface = s => d => s.surface_id == d.surface_id;

const prepareLinkData = function(props){
  const {surfaces, sectionIndex} = props;
  if (!surfaces.length) return null;

  /*
  Deconflict surfaces
  The below is a fairly complex way to make sure multiple surfaces
  aren't connected in the same stack.
  Should probably do this with a group by...
  */
  const sectionSurfaces = {};

  // weed out lithostratigraphy for now
  const sequenceStratSurfaces = surfaces.filter(d => d.surface_id != null)

  for (const {surface_id, section_height} of sequenceStratSurfaces) {
    for (let {section, ...rest} of section_height) {
      if (sectionSurfaces[section] == null) { sectionSurfaces[section] = []; }
      sectionSurfaces[section].push({surface_id, ...rest});
    }
  }

  // Backdoor way to get section stacks (group by column x position)
  const sectionStacks = group(Object.values(sectionIndex), d => d.x);

  const buildSectionStack = surfacesBuilder({sectionSurfaces, sectionIndex});

  //# Build up stacked sections
  let stackSurfaces = Array.from(sectionStacks, ([x, stackedSections])=>{
    const values = buildSectionStack(stackedSections);
    // Save generated index to appropriate stack
    return {x,values};
  });

  stackSurfaces.sort((a,b)=>a.x-b.x);

  // Turn back into surface-oriented list
  return sequenceStratSurfaces.map(s =>{
    let section_height = stackSurfaces
      .map(v => v.values.find(sameSurface(s)))
      .filter(v => v != null)
    return {...s, section_height};
  });
};

export {prepareLinkData}
