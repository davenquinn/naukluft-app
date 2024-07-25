SELECT *
FROM carbon_isotopes.all_data
WHERE orig_height IS NOT null
  AND NOT is_failure
  AND in_zebra_nappe 
ORDER BY height;
