SELECT
  locality,
  surface,
  upper_section::text,
  lower_section::text
FROM section.locality_generalized_breaks;
