printer = new Printer({buildDir: `${__dirname}/output`})

printer
  .task('Summary-Sections.pdf', './dist-figures/regional-sections.js')
  .task('Regional-Sections.pdf', './regional-sections.ts')
  .task('Section-Details.pdf', './section-details.ts')

module.exports = printer;
