getGeneralizedHeight = (sectionData, opts={})->
  # Manage the top and bottom heights allowed
  # using only the first section
  upperHeight = {}
  lowerHeight = {}
  for {key, surfaces} in sectionData
    if opts.topSurface?
      s = surfaces.find (d)->d.surface == opts.topSurface
      upperHeight[key] = s.bottom
    if opts.bottomSurface?
      s = surfaces.find (d)->d.surface == opts.bottomSurface
      lowerHeight[key] = s.bottom

  return (surface)->
    # Gets heights of a surface in stacked sections
    {section, height, inferred} = surface
    for {key, surfaces} in sectionData
      for s in surfaces
        continue unless s.original_section.trim() == section.trim()
        continue unless s.original_bottom == height
        # Make sure we only take links between upper and lower surfaces if set
        continue if upperHeight[key]? and upperHeight[key] < s.bottom
        continue if lowerHeight[key]? and lowerHeight[key] > s.bottom
        return {section: s.section, height: s.bottom, inferred}
    return null

updateSectionE = (sections)->
  # Special case for upper Lemoenputs formation in
  # Section E: add 10 m for probable tectonic attenuation of shale
  Ubisis = sections.find (d)->d.key == 'Ubisis'
  return unless Ubisis?
  divisions = Ubisis.surfaces
  ix = divisions.findIndex (d)-> d.id == 502
  return if ix == -1
  addedHeight = 30
  divisions[ix].top += addedHeight
  for i in [ix+1...divisions.length]
    divisions[i].bottom += addedHeight
    divisions[i].top += addedHeight

export {getGeneralizedHeight, updateSectionE}
