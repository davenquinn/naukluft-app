SELECT
  id::integer,
  strike,
  dip,
  trend,
  plunge,
  ST_AsGeoJSON(ST_Transform(geometry, 4326))::json geometry,
  plane_type,
  notes::text,
  date,
  overturned,
  unit_id,
  'Feature' "type"
FROM mapping.orientation
WHERE geometry IS NOT null