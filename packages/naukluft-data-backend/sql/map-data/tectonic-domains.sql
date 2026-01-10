/** Note: the footwall domain is not included in this query,
  * as it is not part of the nappe complex. It can be represented implicitly.
 */
WITH nappe_complex AS (
  SELECT
    'nnc',
    ST_ChaikinSmoothing(st_simplify(st_union(geometry), 100), 2) geometry,
    '#000000' AS color,
    FALSE AS in_nappe,
    NULL AS tectonic_unit
  FROM mapping.generalized_face
  WHERE
    tectonic_unit IS NOT NULL
),
base AS (
  SELECT
    st_union(st_intersection(mf.geometry, nnc.geometry)) geometry,
    mf.unit_id
  FROM map_topology.map_face mf
         JOIN nappe_complex nnc ON st_intersects(mf.geometry, nnc.geometry)
  WHERE
    mf.map_layer = (
      SELECT id
      FROM map_digitizer.map_layer
      WHERE name = 'Structural Domain'
    )
  GROUP BY mf.unit_id
)
SELECT
    unit_id id,
    'Feature' AS "type",
    ST_AsGeoJSON(ST_Transform(geometry, 4326))::json geometry,
    json_build_object(
        'unit_id', unit_id
    ) AS properties
FROM base;
