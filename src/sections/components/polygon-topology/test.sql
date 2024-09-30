WITH a AS (
SELECT
  (ST_Dump(ST_Node(
    ST_GeomFromGeoJSON('{"type": "MultiLineString", "coordinates": [[[0,0],[1,0],[1,1],[0,0]]]}')
  ))).geom
),
d AS (
SELECT '[{"id": "A", "geometry": {"type": "Point", "coordinates": [0.8,0.2]}}]'::json AS data
),
b AS (
SELECT json_array_elements(data) AS feature FROM d
),
facies_point AS (
SELECT
	ST_GeomFromGeoJSON(feature->'geometry') geometry,
	feature->'id' AS facies_id
FROM b
),
features AS (
  SELECT (ST_Dump(
      ST_Polygonize(geom)
  )).geom AS geometry FROM a
)
SELECT
  'Feature' AS type,
  ST_AsGeoJSON(f.geometry)::json geometry,
  p.facies_id
FROM features f
LEFT JOIN facies_point p
  ON ST_Intersects(f.geometry, p.geometry);