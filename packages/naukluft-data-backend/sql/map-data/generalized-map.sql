WITH units AS (
  SELECT
    unit_id,
    st_chaikinsmoothing(st_simplify(geometry, 100), 2) geometry,
    coalesce(g.color, t.color) color,
    (tectonic_unit IS NOT NULL) AS in_nappe,
    tectonic_unit
  FROM {{mapping}}.generalized_face g
         LEFT JOIN {{mapping}}.tectonic_unit t
                   ON g.tectonic_unit = t.id
  ORDER BY st_area(geometry) DESC
),
     u1 AS (
  SELECT *
  FROM units
  UNION ALL
  SELECT
    'nnc',
    ST_ChaikinSmoothing(st_simplify(st_union(geometry), 100), 2) geometry,
    '#000000' AS color,
    FALSE AS in_nappe,
    NULL AS tectonic_unit
  FROM {{mapping}}.generalized_face
  WHERE
    tectonic_unit IS NOT NULL

)
SELECT
  st_asgeojson(st_transform(geometry, 4326))::json geometry,
  json_build_object(
    'unit_id', unit_id,
    'in_nappe', in_nappe,
    'tectonic_unit', tectonic_unit,
    'color', color
  ) AS properties,
  'Feature' AS "type"
FROM u1;
