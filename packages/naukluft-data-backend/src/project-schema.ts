import dotenv from "dotenv";

// Server-only module (see the lazy `require`s in database.ts / updates.ts).
// Guard against accidental client bundling so a missing `process` can't crash.
if (typeof process !== "undefined") {
  dotenv.config();
}

/*
 * Project-scoped schema resolution.
 *
 * The Naukluft project used to live in its own database with bare schema
 * names (`section`, `mapping`, `carbon_isotopes`, `map_digitizer`,
 * `map_topology`) plus loose tables in `public`. After the multi-tenant
 * migration it lives in the shared `mapboard` database, and every schema is
 * renamed to `mb_<slug>_<uuid8>_<discriminator>`.
 *
 * SQL query files reference schemas through `{{token}}` placeholders; this
 * module maps each logical token to the concrete schema name for the active
 * project, driven by NAUKLUFT_SCHEMA_PREFIX.
 */

const PREFIX =
  (typeof process !== "undefined"
    ? process.env.NAUKLUFT_SCHEMA_PREFIX
    : undefined) ?? "mb_naukluft_2517c1e5";

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

function schemaName(suffix: string): string {
  const name = `${PREFIX}_${suffix}`;
  // Schema names come from trusted config, but validate before we splice them
  // into SQL text so a bad env value fails loudly instead of injecting.
  if (!IDENTIFIER.test(name)) {
    throw new Error(`Invalid schema name derived from config: ${name}`);
  }
  return name;
}

/** Logical token (as used in `{{token}}` in SQL) -> concrete schema name. */
export const schemaMap: Record<string, string> = {
  section: schemaName("section"),
  mapping: schemaName("mapping"),
  carbon_isotopes: schemaName("carbon_isotopes"),
  map_data: schemaName("map_data"), // legacy `map_digitizer`
  map_topo: schemaName("map_topo"), // legacy `map_topology`
  base: schemaName("base"), // legacy loose `public` tables
};

const TOKEN = /\{\{(\w+)\}\}/g;

/** Replace `{{token}}` schema placeholders with concrete schema names. */
export function resolveSchemas(sql: string): string {
  return sql.replace(TOKEN, (_, token: string) => {
    const name = schemaMap[token];
    if (name == null) {
      throw new Error(`Unknown schema token in SQL: {{${token}}}`);
    }
    return name;
  });
}
