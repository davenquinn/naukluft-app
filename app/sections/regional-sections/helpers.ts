const getGeneralizedHeight = function(sectionData, opts={}){
  // Manage the top and bottom heights allowed
  // using only the first section
  let divisions, key;
  const upperHeight = {};
  const lowerHeight = {};
  for ({key, divisions} of Array.from(sectionData)) {
    var s;
    if (opts.topSurface != null) {
      s = divisions.find(d => d.surface === opts.topSurface);
      upperHeight[key] = s.bottom;
    }
    if (opts.bottomSurface != null) {
      s = divisions.find(d => d.surface === opts.bottomSurface);
      lowerHeight[key] = s.bottom;
    }
  }

  return function(surface){
    // Gets heights of a surface in stacked sections
    const {section, height, inferred} = surface;
    console.log(sectionData)
    for ({key, divisions} of Array.from(sectionData)) {
      for (let d of Array.from(divisions)) {
        if (d.original_section != section) { continue; }
        if (d.original_bottom !== height) { continue; }
        // Make sure we only take links between upper and lower surfaces if set
        if ((upperHeight[key] != null) && (upperHeight[key] < d.bottom)) { continue; }
        if ((lowerHeight[key] != null) && (lowerHeight[key] > d.bottom)) { continue; }
        return {section: d.section, height: d.bottom, inferred};
      }
    }
    return null;
  };
};

const updateSectionE = function(sections){
  // Special case for upper Lemoenputs formation in
  // Section E: add 10 m for probable tectonic attenuation of shale
  const Ubisis = sections.find(d => d.key === 'Ubisis');
  if (Ubisis == null) { return; }
  const {divisions} = Ubisis;
  const ix = divisions.findIndex(d => d.id === 502);
  if (ix === -1) { return; }
  const addedHeight = 30;
  divisions[ix].top += addedHeight;
  return (() => {
    const result = [];
    for (let start = ix+1, i = start, end = divisions.length, asc = start <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      divisions[i].bottom += addedHeight;
      result.push(divisions[i].top += addedHeight);
    }
    return result;
  })();
};

export {getGeneralizedHeight, updateSectionE};
