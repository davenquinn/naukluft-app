SELECT
  id::text,
  name::text,
  color::text,
  symbol,
  symbol_color,
  topology
FROM
  map_digitizer.polygon_type
ORDER BY name;
