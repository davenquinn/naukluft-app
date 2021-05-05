-- Right now this only gets carbon isotope samples
-- but this is mostly what we care about.
SELECT
  a.analysis_id,
  a.sample_id,
  a.date,
  s.section,
  s.height,
  c.corr_delta13c avg_delta13c,
  c.std_delta13c,
  c.corr_delta18o avg_delta18o,
  c.corr_delta18o
FROM carbon_isotopes.analysis a
JOIN carbon_isotopes.sample s
  ON s.id = a.sample_id
JOIN carbon_isotopes.corrected_data c
  ON c.analysis_id = a.analysis_id
WHERE s.section = $1
  AND s.height IS NOT null
ORDER BY s.height
