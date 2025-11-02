SELECT
    id,
    'Feature' AS "type",
    ST_AsGeoJSON(ST_Transform(geometry, 4326))::json geometry
FROM mapping.tectonic_domain;
