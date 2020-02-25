printer = new Printer({buildDir: `${__dirname}/../output`})

printer.task(
  'Summary-Sections.pdf',
  './sections/summary-sections/__static-figure/index.ts',
  // must be relative to entry file for now
  {webpackConfig: '../../../../webpack.figures.js'}
)
  //.task('Regional-Sections.pdf', './app/regional-sections.ts', {webpackConfig})
  //.task('Section-Details.pdf', './section-details.ts', {webpackConfig})

module.exports = printer;
