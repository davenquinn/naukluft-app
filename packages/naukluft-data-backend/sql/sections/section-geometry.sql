WITH sections AS (
    SELECT
        trim(s.id) section_id,
        s.location,
        geometry
    FROM section.section s
    JOIN section.section_location sl
    ON s.id = sl.section
), sections_ext AS (
    SELECT
        *,
        section_id NOT IN ('L') in_strat_model,
        section_id NOT IN ('L', 'M', 'K') in_generalized
    FROM sections
),
composited_sections AS (SELECT location section_id,
                               location,
                               array_agg(section_id) composited_from,
                               ST_Union(geometry)    geometry
                        FROM sections_ext
                        WHERE in_generalized
                        GROUP BY location),
all_sections AS (SELECT section_id,
                        geometry,
                        location,
                        null composited_from,
                        in_strat_model,
                        in_generalized,
                        false is_generalized
                 FROM sections_ext
                 UNION ALL
                 SELECT section_id,
                        geometry,
                        location,
                        composited_from,
                        true in_strat_model,
                        true in_generalized,
                        true is_generalized
                 FROM composited_sections
)
SELECT
    section_id,
    ST_AsGeoJSON(ST_Transform((ST_MinimumBoundingRadius(geometry)).center, 4326))::json AS geometry,
    (ST_MinimumBoundingRadius(geometry)).radius AS radius,
    location,
    in_strat_model,
    in_generalized,
    is_generalized
FROM all_sections;
