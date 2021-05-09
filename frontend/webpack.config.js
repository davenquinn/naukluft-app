const path = require("path");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const { IgnorePlugin, EnvironmentPlugin } = require("webpack");
const historyFallback = require("connect-history-api-fallback");

const {
  resolve,
  cssModuleLoader,
  coffeeRule,
  jsRule,
  cssRule
} = require("./loaders");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const RevisionInfoWebpack = require("@macrostrat/revision-info-webpack");
const DotenvPlugin = require("dotenv-webpack");

const pkg = require("./package.json");
const GITHUB_LINK = "https://github.com/davenquinn/naukluft-app";

const mode = "development";

const webRoot = path.resolve(__dirname, "dist-web");

const browserSync = new BrowserSyncPlugin({
  port: 3000,
  host: "localhost",
  server: {
    baseDir: webRoot,
    middleware: [historyFallback()]
  }
});

const uglify = new UglifyJsPlugin();

const plugins = [browserSync];
const ignores = [/^electron/, /^pg/, /^fs/];

for (let i of Array.from(ignores)) {
  plugins.push(new IgnorePlugin(i));
}

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
        use: ["style-loader", cssModuleLoader, "stylus-loader"],
        exclude: /node_modules/
      },
      jsRule,
      cssRule,
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "fonts/"
            }
          }
        ]
      },
      {
        test: /\.(png|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              useRelativePath: true,
              outputPath: "sections/assets/",
              name: "[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  resolve,
  entry: {
    "assets/web": "./app/web-index.ts"
  },
  output: {
    path: webRoot,
    filename: "[name].js",
    sourceMapFilename: "[file].map",
    publicPath: "/"
  },
  plugins: [
    ...plugins,
    new DotenvPlugin({ path: "../.env" }),
    new HTMLWebpackPlugin({
      title: "Naukluft Nappe Complex",
      base: "/",
      publicPath: "/"
    }),
    new EnvironmentPlugin({
      ...RevisionInfoWebpack(pkg, GITHUB_LINK),
      NODE_ENV: JSON.stringify(mode)
    })
  ]
};
