SELECT l.id,
 l.facies,
 l.facies_tract,
 l.section,
 f.color AS facies_color,
 l.lithology,
 l.covered,
 l.flooding_surface_order,
 l.surface,
 ss.note,
 COALESCE(l.definite_boundary, true) AS definite_boundary,
 COALESCE(v.pattern, l.lithology) AS pattern,
 COALESCE(l.schematic, false) AS schematic,
 l.fgdc_pattern::text AS fgdc_pattern,
 l.bottom::double precision AS bottom,
 COALESCE(lead(l.bottom) OVER (PARTITION BY l.section ORDER BY l.bottom), s."end")::double precision AS top,
 t.tree,
 l.grainsize,
 l.surface_type,
 l.surface_order,
 COALESCE(COALESCE(l.fill_pattern, v.pattern), l.lithology) AS fill_pattern
FROM section.section_lithology l
  LEFT JOIN section.lithology_tree t ON l.lithology = t.id
  LEFT JOIN section.surface ss ON l.surface = ss.id
  LEFT JOIN section.facies f ON l.facies = f.id
  LEFT JOIN section.lithology v ON l.lithology = v.id
  JOIN section.section s ON s.id = l.section
WHERE section = $1::text
ORDER BY bottom;
