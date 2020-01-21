WITH sec AS (
SELECT
  id,
  geometry,
  vertical_geom
FROM cross_section.section
WHERE id = ${section}
),
sec_unit AS (
SELECT
  s.id,
  unit_id,
  s.geometry,
  ST_StartPoint(s.geometry) AS start,
  ST_EndPoint(s.geometry) AS end_,
  (ST_Dump(ST_Intersection(f.geometry, s.geometry))).geom geom
FROM mapping.map_face f, sec s
WHERE f.topology = 'bedrock'
),
indexed AS (
SELECT
  *,
  ST_Distance(start, geom) AS startpt,
  (ST_Length(geometry)-ST_Distance(end_,geom)) AS endpt
FROM sec_unit
)
SELECT
  row_number() OVER () id,
  i.id section,
  unit_id,
  color,
  ST_AsGeoJSON(ST_Intersection(
    ST_MakeEnvelope(startpt, -5000, endpt, 5000),
    (SELECT vertical_geom FROM sec)
  )) geom
FROM indexed i
JOIN mapping.unit
  ON unit.id = unit_id
ORDER BY i.id, start;
