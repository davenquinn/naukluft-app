/** Finish merging the Naukluft data into the Mapboard database.
  *
  * Run once against the `mapboard` database (applied locally on 2026-09-25). The
  * Naukluft project lives there in the `mb_naukluft_2517c1e5_*` schemas, but two
  * pieces were still read from the legacy `naukluft` database through postgres_fdw:
  *
  * 1. The 908 field stations had never been copied into
  *    `mb_naukluft_2517c1e5_map_data.stations`. They are copied here with their ids.
  * 2. The `naukluft_map_data` and `naukluft_cross_sections` schemas held foreign tables
  *    mirroring the legacy `map_digitizer` and `cross_section` schemas, through the
  *    `naukluft` foreign server. They are dropped here.
  *
  * Mapboard's `mapboard_api.polygon_type` and `mapboard_api.stations` views read from
  * those foreign tables. They were repointed at the merged tables beforehand, in
  * Mapboard-Platform's `py-modules/cli/core-fixtures/02.1-api-transitional.sql`.
 **/

/* 1. Stations (`vertical` and `horizontal` are generated from dip and plunge) */
INSERT INTO mb_naukluft_2517c1e5_map_data.stations (
  id, geometry, type, name, uuid, notes, altitude, strike, dip, trend, plunge,
  overturned, "date", unit_id, unit_name, cleavage, bedding,
  lineation, fold_axis, fault, source, data
)
SELECT
  id, geometry, type, name, uuid, notes, altitude, strike, dip, trend, plunge,
  overturned, "date", unit_id, unit_name, cleavage, bedding,
  lineation, fold_axis, fault, source, data
FROM naukluft_map_data.stations;

SELECT setval(
  'mb_naukluft_2517c1e5_map_data.stations_id_seq',
  (SELECT max(id) FROM mb_naukluft_2517c1e5_map_data.stations)
);

/* 2. Foreign-table mirrors of the legacy database */
DO $$
BEGIN
  -- Refuse to continue while any view still reads a foreign table: the CASCADE
  -- below would silently drop it.
  IF EXISTS (
    SELECT 1
    FROM pg_depend d
    JOIN pg_rewrite r ON r.oid = d.objid
    JOIN pg_class t ON t.oid = d.refobjid
    WHERE t.relkind = 'f'
  ) THEN
    RAISE EXCEPTION 'Views still depend on foreign tables; apply the updated Mapboard views first';
  END IF;
END $$;

DROP SCHEMA IF EXISTS naukluft_map_data CASCADE;
DROP SCHEMA IF EXISTS naukluft_cross_sections CASCADE;
DROP SERVER IF EXISTS naukluft CASCADE;
