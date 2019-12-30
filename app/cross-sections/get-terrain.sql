SELECT
  id,
  name,
  vertical_geom AS geometry
FROM cross_section.section
ORDER BY id;
