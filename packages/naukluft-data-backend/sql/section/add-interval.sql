INSERT INTO section.section_lithology
  (section, bottom)
VALUES (${section}, round(${height}::numeric,2))
RETURNING id
