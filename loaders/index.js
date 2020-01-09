const path = require('path');
const __base = path.resolve(__dirname, '..');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env'],
  }
};

const coffeeLoader = {
  loader: 'coffee-loader',
  options: {sourceMap: true}
};

const cssModuleLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      mode: 'global',
      localIdentName: '[name]__[local]___[hash:base64:5]'
    }
  }
};

function sharedLoaders(isWeb) {
  let loaders = [
      {
      test: /\.coffee$/,
      use: [babelLoader, coffeeLoader],
      exclude: /node_modules/
    },
    {
      test: /\.styl$/,
      use: ["style-loader", cssModuleLoader, "stylus-loader"],
      exclude: /node_modules/
    },
    {
      test: /\.css$/,
      use: ["style-loader", cssModuleLoader],
      exclude: /node_modules/
    },
    {
      test: /\.(js|jsx)$/,
      use: [babelLoader],
      exclude: /node_modules/
    },
    {
      test: /\.sql$/,
      use: {
        loader: path.resolve(__dirname, "./sql-loader.js")
      },
      exclude: /node_modules/
    }
  ]

  delete loaders[2].exclude;

  return loaders;
};

const resolve = {
  extensions: ['.js', '.coffee'],
  alias: {
    app: path.resolve(__base, 'app/'),
    react: path.resolve(__base,'./app/node_modules/react'),
    /*
    This is a pretty awful hack to resolve tilde paths. It requires
    that they exist only in the column-components package.
    */
    "#": path.resolve(__base, 'app', 'bundled-deps', 'column-components', 'src'),
    "~": path.resolve(__base, 'app')
  }
};

module.exports = {sharedLoaders, resolve};
