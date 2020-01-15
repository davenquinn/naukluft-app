const path = require('path');
const __base = path.resolve(__dirname, '..');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env', '@babel/preset-react'],
  }
};

const coffeeLoader = {
  loader: 'coffee-loader',
  options: {sourceMap: true}
};

const sqlRule = {
  test: /\.sql$/,
  use: {
    loader: path.resolve(__dirname, "./sql-loader.js")
  },
  exclude: /node_modules/
}

const cssModuleLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      mode: 'global',
      localIdentName: '[name]__[local]___[hash:base64:5]'
    }
  }
};

const cssRule = {
  test: /\.css$/,
  use: ["style-loader", cssModuleLoader],
}

const jsRule = {
  test: /\.(js|jsx)$/,
  use: [babelLoader],
  exclude: /node_modules/
}

const coffeeRule = {
  test: /\.coffee$/,
  use: [babelLoader, coffeeLoader],
  exclude: [/node_modules/]
}

const stylusRule = {
  test: /\.styl$/,
  use: [
    "css-hot-loader",
    require.resolve("mini-css-extract-plugin/dist/loader"),
    cssModuleLoader,
    "stylus-loader"
  ],
  exclude: /node_modules/
}

const resolve = {
  extensions: ['.js', '.coffee'],
  alias: {
    app: path.resolve(__base, 'app/'),
    react: path.resolve(__base,'./app/node_modules/react'),
    /*
    This is a pretty awful hack to resolve tilde paths. It requires
    that they exist only in the column-components package.
    */
    "~": path.resolve(__base, 'app')
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
