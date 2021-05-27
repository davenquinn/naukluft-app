SELECT *
FROM carbon_isotopes.all_data
WHERE orig_height IS NOT null
  AND failure_mode IS null
ORDER BY height;
