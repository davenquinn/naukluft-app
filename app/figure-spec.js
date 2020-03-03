const Figment = require("figment-ui").default

const viz = new Figment({buildDir: `${__dirname}/../output`})
const webpackConfig = require.resolve(`${__dirname}/../webpack.figures.js`)

viz.task(
  'Summary-Sections.pdf',
  './sections/summary-sections/__static-figure/index.ts',
  {webpackConfig})

viz.task(
  'Regional-Sections.pdf',
  './sections/regional-sections/__static-figure/index.ts',
  {webpackConfig})

viz.task(
  'Section-Details.pdf',
  './sections/section-details/index.ts',
  {webpackConfig})

viz.task(
  'Generalized-Sections.pdf',
  './sections/generalized-sections/__static-figure/index.ts',
  {webpackConfig})

module.exports = viz;
