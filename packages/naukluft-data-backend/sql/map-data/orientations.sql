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
  (tectonic_unit IS NOT null) AS in_nappe,
  'Feature' "type",
  unit_name,
  date,
  overturned,
  cleavage,
  bedding,
  lineation,
  fold_axis,
  fault,
  tectonic_unit,
  color
FROM mapping.orientation
LEFT JOIN mapping.tectonic_domain d
  ON ST_Intersects(d.geometry, o.geometry)
WHERE geometry IS NOT null;
