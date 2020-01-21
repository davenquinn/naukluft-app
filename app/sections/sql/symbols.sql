SELECT
  id,
  section::text section_id,
  symbol,
  coalesce(symbol_min_zoom, 0) symbol_min_zoom,
  (
    start_height+coalesce(
    end_height,start_height)
  )/2 height
FROM section.section_note
WHERE symbol IS NOT null;
