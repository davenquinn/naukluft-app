const path = require("path");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const { IgnorePlugin, EnvironmentPlugin } = require("webpack");
const historyFallback = require("connect-history-api-fallback");
const merge = require("webpack-merge");
const {
  resolve,
  cssModuleLoader,
  coffeeRule,
  jsRule,
  cssRule,
} = require("./loaders");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const RevisionInfoWebpack = require("@macrostrat/revision-info-webpack");
const DotenvPlugin = require("dotenv-webpack");
const CesiumWebpackConfig = require("./packages/cesium-viewer/webpack4-plugins");

const pkg = require("./package.json");
const GITHUB_LINK = "https://github.com/davenquinn/naukluft-app";

const mode = process.env.NODE_ENV || "development";
const publicPath = process.env.PUBLIC_PATH || "/";

const webRoot = path.resolve(__dirname, "dist-web");

let plugins = [];

if (mode == "development") {
  const browserSync = new BrowserSyncPlugin({
    port: 3000,
    host: "localhost",
    // use single-page routing
    single: true,
    server: {
      baseDir: webRoot,
    },
  });
  plugins.push(browserSync);
}
const ignores = [/^electron/, /^pg/, /^fs/];

for (let i of Array.from(ignores)) {
  plugins.push(new IgnorePlugin(i));
}

const baseConfig = {
  devtool: "source-map",
  mode,
  module: {
    rules: [
      coffeeRule,
      {
        test: /\.sql$/,
        use: ["filename-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.styl$/,
        use: ["style-loader", cssModuleLoader, "stylus-loader"],
        exclude: /node_modules/,
      },
      jsRule,
      cssRule,
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "fonts/",
            },
          },
        ],
      },
      {
        test: /\.(png|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              useRelativePath: true,
              outputPath: "sections/assets/",
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve,
  entry: {
    "assets/web": "./app/web-index.ts",
  },
  output: {
    path: webRoot,
    filename: "[name].js",
    sourceMapFilename: "[file].map",
    publicPath,
    // Needed to do this to address a security issue
    hashFunction: "sha256",
  },
  plugins: [
    ...plugins,
    new DotenvPlugin({ path: "../.env" }),
    new HTMLWebpackPlugin({
      title: "Zebra Nappe mapping and stratigraphy",
      base: publicPath,
      publicPath,
    }),
    new EnvironmentPlugin({
      ...RevisionInfoWebpack(pkg, GITHUB_LINK),
      PUBLIC_PATH: publicPath,
      NODE_ENV: JSON.stringify(mode),
      NAUKLUFT_ALLOW_EDITING: true,
    }),
    new EnvironmentPlugin([
      "NAUKLUFT_API_BASE_URL",
      "NAUKLUFT_MAP_RELOADER_URL",
    ]),
  ],
};

module.exports = merge(baseConfig, CesiumWebpackConfig(publicPath));
