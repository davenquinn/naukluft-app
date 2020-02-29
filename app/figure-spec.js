const Figment = require("figment-ui").default

const viz = new Figment({buildDir: `${__dirname}/../output`})
const webpackConfig = require.resolve(`${__dirname}/../webpack.figures.js`)

viz.task(
  'Summary-Sections.pdf',
  './sections/summary-sections/__static-figure/index.ts',
  // must be relative to entry file for now
  {webpackConfig})

viz.task(
  'Regional-Sections.pdf',
  './sections/regional-sections/__static-figure/index.ts',
  {webpackConfig})
  //.task('Section-Details.pdf', './section-details.ts', {webpackConfig})

module.exports = viz;
