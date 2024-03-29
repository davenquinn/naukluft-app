WITH a AS (
SELECT
  (ST_Dump(ST_Node(
    ST_GeomFromGeoJSON(${geometry:json}::json)
  ))).geom
),
d AS (
SELECT ${points:json}::json AS data
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
