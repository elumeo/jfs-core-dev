const { resolve } = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const {
  projectPath,
  common,
  local,
  typescriptRule,
  babelLoader,
  atLoader,
  sassRule,
  jsonRule
} = require('./webpack.common.js');

const mode = process.argv.includes('--watch') ? 'watch' : 'devServer';
const https = mode === 'devServer' && process.argv.includes('--https');

module.exports = {
  ...common,
  devtool: 'cheap-module-source-map',
  plugins: [
    ...common.plugins,
    new ForkTsCheckerWebpackPlugin({ tsconfig: resolve('./tsconfig.json') }),
    new CompressionPlugin({ test: [/\.tsx/, /\.ts/, /\.js/], minRatio: 0.1 }),
    new webpack.NamedModulesPlugin()
  ]
};

if (mode === 'devServer') {
  const host = local ? local.hostname : '127.0.0.1';
  const port = local ? local.port : '2008';

  module.exports.devServer = {
    https,
    contentBase: resolve(projectPath, 'dist'),
    hot: true,
    inline: true,
    compress: true,
    historyApiFallback: true,
    disableHostCheck: true,
    noInfo: true,
    host: host,
    port: port,
    publicPath: '/',
    watchOptions: {
      poll: 1500,
      ignored: /node_modules\/(?!@elumeo).*$/,
      aggregateTimeout: 200
    }
  };

  const entry = module.exports.entry[0];

  module.exports.entry = () => [
    `webpack-dev-server/client?http://${host}:${port}/`,
    'webpack/hot/only-dev-server',
    entry
  ];

  module.exports.output.publicPath = `http://localhost:${port}/`;

  module.exports.module.rules = [
    {
      ...typescriptRule,
      use: [
        { loader: 'react-hot-loader/webpack' },
        {
          ...babelLoader,
          options: {
            ...babelLoader.options,
            presets: [...babelLoader.options.presets, 'react-hmre']
          }
        },
        atLoader
      ]
    },
    sassRule,
    jsonRule
  ];

  module.exports.plugins.push(new webpack.HotModuleReplacementPlugin());
}
