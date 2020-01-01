SELECT
  id,
  name,
  ST_AsGeoJSON(vertical_geom)::json AS geometry,
  ST_YMin(vertical_geom) ymin,
  ST_YMax(vertical_geom) ymax
FROM cross_section.section
ORDER BY id;
