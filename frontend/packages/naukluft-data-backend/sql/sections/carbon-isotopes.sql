SELECT *
FROM carbon_isotopes.all_data
WHERE height IS NOT null
  AND in_zebra_nappe
  AND failure_mode IS null
ORDER BY height;
