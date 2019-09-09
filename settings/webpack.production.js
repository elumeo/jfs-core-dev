const { resolve } = require('path');

const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const { projectPath, common, local } = require('./webpack.common.js');

process.env.NODE_ENV = 'production';

module.exports = {
  ...common,
  plugins: [
    ...common.plugins,
    new CheckerPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: { screw_ie8: true, warnings: false },
      output: { comments: false },
      sourceMap: false
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    // Eliminate more unused lodash code
    new LodashModuleReplacementPlugin()
  ]
};
