const {IgnorePlugin} = require('webpack');
const pkg = require('./package.json')
const path = require('path');

const {
  resolve,
  coffeeLoader,
  cssModuleLoader,
  babelLoader,
  coffeeRule,
  jsRule,
  cssRule
} = require('./loaders');

const mode = 'development';

const plugins = [];

console.log(pkg);

module.exports = {
  context: path.resolve(__dirname),
  devtool: "eval-source-map",
  externals: Object.keys(pkg.dependencies),
  target: 'electron-renderer',
  mode,
  module: {
    rules: [
      coffeeRule,
      {
        test: /\.sql$/,
        use: {
          loader: path.resolve(__dirname, "loaders", "sql-loader.js")
        },
        exclude: /node_modules/
      },
      {
        test: /\.styl$/,
        use: [
          "style-loader",
          cssModuleLoader,
          "stylus-loader"
        ],
        exclude: /node_modules/
      },
      jsRule,
      cssRule,
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
        test: /\.(png|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              useRelativePath: true,
              outputPath: 'sections/assets/',
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  node: {
    __dirname: true,
    __filename: true
  },
  resolve,
  plugins: [],
  entry: {
    'regional-sections': "./app/sections/regional-sections/__static-figure/index.ts"
  },
  output: {
    path: path.resolve("./dist-figures"),
    filename: "[name].js",
    sourceMapFilename: '[file].map'
  }
};
