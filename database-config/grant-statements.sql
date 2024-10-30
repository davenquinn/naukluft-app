/** Grant statements that were manually run to
  allow the `naukluft` user to access the database.
 */

GRANT USAGE ON SCHEMA carbon_isotopes TO naukluft;
GRANT SELECT ON ALL TABLES IN SCHEMA carbon_isotopes TO naukluft;

GRANT USAGE ON SCHEMA section TO naukluft;
GRANT SELECT ON ALL TABLES IN SCHEMA section TO naukluft;

GRANT USAGE ON SCHEMA public TO naukluft;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO naukluft;

GRANT USAGE ON SCHEMA mapping TO naukluft;
GRANT SELECT ON ALL TABLES IN SCHEMA mapping TO naukluft;
