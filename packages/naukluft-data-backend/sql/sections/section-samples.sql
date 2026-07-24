-- Right now this only gets carbon isotope samples
-- but this is mostly what we care about.
SELECT
  a.analysis_id,
  a.sample_id,
  a.date,
  s.section,
  s.height,
  c.avg_delta13c_corr avg_delta13c,
  c.std_delta13c,
  c.avg_delta18o_corr avg_delta18o,
  c.std_delta18o
FROM {{carbon_isotopes}}.analysis a
JOIN {{carbon_isotopes}}.sample s
  ON s.id = a.sample_id
JOIN {{carbon_isotopes}}.corrected_data c
  ON c.analysis_id = a.analysis_id
WHERE s.section = $1
  AND s.height IS NOT null
ORDER BY s.height
