const path = require("path");
const __base = path.resolve(__dirname, "..");

const babelLoader = {
  loader: "babel-loader",
  options: {
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript"
    ],
    plugins: [
      "@babel/plugin-proposal-nullish-coalescing-operator",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-class-properties"
    ]
  }
};

const coffeeLoader = {
  loader: "coffee-loader",
  options: { sourceMap: true }
};

const sqlRule = {
  test: /\.sql$/,
  use: {
    loader: path.resolve(__dirname, "./sql-loader.js")
  },
  exclude: /node_modules/
};

const cssModuleLoader = {
  loader: "css-loader",
  options: {
    modules: {
      mode: "global",
      localIdentName: "[name]__[local]___[hash:base64:5]"
    }
  }
};

const cssRule = {
  test: /\.css$/,
  use: ["style-loader", cssModuleLoader]
};

const jsRule = {
  test: /\.(js|jsx|ts|tsx)$/,
  use: [babelLoader],
  exclude: /node_modules/
};

const coffeeRule = {
  test: /\.coffee$/,
  use: [babelLoader, coffeeLoader],
  exclude: [/node_modules/]
};

const stylusRule = {
  test: /\.styl$/,
  use: [
    "css-hot-loader",
    require.resolve("mini-css-extract-plugin/dist/loader"),
    cssModuleLoader,
    "stylus-loader"
  ],
  exclude: /node_modules/
};

const resolve = {
  extensions: [".js", ".coffee", ".ts"],
  alias: {
    app: path.resolve(__base, "app/"),
    /*
    This is a pretty awful hack to resolve tilde paths. It requires
    that they exist only in the column-components package.
    */
    "~": path.resolve(__base, "app"),
    "@macrostrat/ui-components": path.resolve(
      __base,
      "packages",
      "ui-components",
      "src"
    ),
    "@macrostrat/column-components": path.resolve(
      __base,
      "packages",
      "column-components",
      "src"
    )
  }
};

module.exports = {
  coffeeRule,
  jsRule,
  coffeeLoader,
  babelLoader,
  cssModuleLoader,
  cssRule,
  sqlRule,
  stylusRule,
  resolve
};
