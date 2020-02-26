const path = require('path');
const {IgnorePlugin, DefinePlugin} = require('webpack');
const {
  resolve,
  coffeeLoader,
  cssModuleLoader,
  coffeeRule,
  jsRule,
  cssRule
} = require('./loaders');

const mode = 'development';

const plugins = [];

module.exports = {
  devtool: "source-map",
  mode,
  module: {
    rules: [
      coffeeRule,
      {
        test: /\.sql$/,
        use: ["filename-loader"],
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
    fs: 'empty'
  },
  resolve,
  plugins
};
