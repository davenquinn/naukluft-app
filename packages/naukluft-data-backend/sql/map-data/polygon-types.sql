SELECT
  id::text,
  name::text,
  color::text,
  symbol,
  symbol_color,
  topological
FROM
  {{map_data}}.polygon_type
ORDER BY name;
