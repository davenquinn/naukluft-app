const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const {IgnorePlugin, DefinePlugin} = require('webpack');
const {sharedLoaders, resolve} = require('./loaders');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const mode = 'development';

const webRoot = path.resolve(__dirname,"dist-web");

const browserSync = new BrowserSyncPlugin({
  port: 3000,
  host: 'localhost',
  server: { baseDir: [ webRoot ] }
});

const define = new DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(mode)
});

const uglify = new UglifyJsPlugin();

const plugins = [browserSync, define];
const ignores = [/^pg-promise/,/^electron/,/^pg/,/^fs/];

for (let i of Array.from(ignores)) {
  plugins.push(new IgnorePlugin(i));
}

module.exports = {
  mode,
  module: {
    rules: [
      ...sharedLoaders(true),
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
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
  resolve,
  entry: {
    'sections/assets/index': "./app/entrypoints/sections-index.coffee",
  },
  output: {
    path: webRoot,
    filename: "[name].js"
  },
  plugins
};
