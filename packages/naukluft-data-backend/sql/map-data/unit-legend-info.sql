  SELECT DISTINCT (unit_id)
    unit_id,
    coalesce(g.color, t.color) color,
    (tectonic_unit IS NOT NULL) AS in_nappe,
    tectonic_unit
  FROM {{mapping}}.generalized_face g
         LEFT JOIN {{mapping}}.tectonic_unit t
                   ON g.tectonic_unit = t.id
