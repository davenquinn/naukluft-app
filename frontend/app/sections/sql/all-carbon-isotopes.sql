WITH a AS (
SELECT
  s.id,
  a.id analysis_name,
  c.analysis_id,
  c.avg_delta13c,
  c.avg_delta18o,
  c.std_delta13c,
  c.std_delta18o,
  c.avg_delta13c_corr,
  c.avg_delta18o_corr,
  c.std_delta13c_corr,
  c.std_delta18o_corr,
  s.section,
  s.height orig_height,
  coalesce(a.failure_mode, ss.failure_mode) failure_mode,
  (section.normalized_height(section::text, s.height::numeric)).*,
  CASE
  WHEN (section = 'J' AND height < 14.3) THEN false
  WHEN section = 'W1' THEN false
  ELSE true
  END AS in_zebra_nappe
FROM carbon_isotopes.analysis a
JOIN carbon_isotopes.sample s
  ON s.id = a.sample_id
JOIN carbon_isotopes.corrected_data c
  ON a.analysis_id = c.analysis_id
JOIN carbon_isotopes.analysis_session ss
  ON ss.date = a.date
)
SELECT *
FROM a
WHERE orig_height IS NOT null
  AND failure_mode IS null
ORDER BY height;
