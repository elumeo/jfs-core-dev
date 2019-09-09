const { resolve } = require('path');
const express = require('express');
const proxy = require('express-http-proxy');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const { projectPath, common, local } = require('./webpack.common.js');

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
  module.exports.devServer = {
    https,
    contentBase: resolve(projectPath, 'dist'),
    compress: true,
    historyApiFallback: true,
    disableHostCheck: true,
    noInfo: true,
    host: local ? local.hostname : '127.0.0.1',
    port: local ? local.port : '2008',
    publicPath: '/',
    watchOptions: {
      poll: 1500,
      ignored: /node_modules\/(?!.*@elumeo).*$/,
      aggregateTimeout: 200
    }
  }

  module.exports.plugins.push(new webpack.HotModuleReplacementPlugin());
}
