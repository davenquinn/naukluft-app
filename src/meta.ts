import h from "@macrostrat/hyper";

const RevisionInfo = () =>
  h("p.version", [
    `${JSON.parse(process.env.NPM_VERSION)} – ${JSON.parse(
      process.env.COMPILE_DATE,
    )}`,
    " (",
    h(
      "a",
      { href: JSON.parse(process.env.GITHUB_REV_LINK) },
      JSON.parse(process.env.GIT_COMMIT_HASH),
    ),
    ")",
  ]);
