const path = require("path");
const findRoot = require("find-root");

const rootImportOpts = {
  root: (sourcePath) => {
    // General transformation attempted but doesn't seem to work
    //return findRoot(sourcePath)
    return path.join(__dirname, "app","bundled-deps", "column-components");
  },
  rootPathPrefix: '~/'
};

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env'],
    // plugins: [
    //   ["babel-plugin-root-import", rootImportOpts]
    // ]
  }
};

const coffeeLoader = {
  loader: 'coffee-loader',
  options: {sourceMap: true}
};

const cssLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      mode: 'global',
      localIdentName: '[name]__[local]___[hash:base64:5]'
    }
  }
};

module.exports = {
  module: {
    rules: [
      {
        test: /\.coffee$/,
        use: [babelLoader, coffeeLoader],
        exclude: /node_modules/
      },
      {
        test: /\.styl$/,
        use: ["style-loader", cssLoader, "stylus-loader"],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", cssLoader],
        exclude: /node_modules/
      },
      {
        test: /\.sql$/,
        use: ["file-loader"],
        exclude: /node_modules/
      }

    ]
  },
  resolve: {
    extensions: ['.js', '.coffee'],
    alias: {
      app: path.resolve(__dirname, 'app/'),
      react: path.resolve(__dirname,'./app/node_modules/react'),
      /*
      This is a pretty awful hack to resolve tilde paths. It requires
      that they exist only in the column-components package.
      */
      "~": path.resolve(__dirname, 'app')
    }
  }
}
