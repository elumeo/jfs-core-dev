const { configFilename } = require("../constants.js");

const { resolve, join } = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const projectPath = resolve(__dirname, '..', '..', '..', '..');

const copyJobs = [
  { from: resolve(projectPath, 'static') },
  { from: resolve(projectPath, configFilename),
    to: resolve(projectPath, 'dist', 'config.json') }
]

module.exports.local = null;
try {
  module.exports.local = require(resolve(projectPath, 'local.js'));
} catch (error) {
  console.error(error.message);
  copyJobs.push({
    from: resolve(projectPath, 'local.js.dist'),
    to: resolve(projectPath, 'local.js')
  });
}

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['react', ['es2015', { modules: false, loose: true }]],
    plugins: ['transform-runtime', 'lodash']
  }
};

const atLoader = { loader: 'awesome-typescript-loader' }

const typescriptRule = {
  test: /\.tsx?$/,
  use: [
    babelLoader,
    atLoader
  ]
};

const sassRule = {
  test: /\.s*css$/,
  loaders: ['style-loader', 'css-loader', 'sass-loader']
}

const jsonRule = {
  test: /\.json$/,
  loaders: ['json-loader']
}

module.exports.common = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    modules: [
      resolve(projectPath, 'src'),
      resolve(projectPath, 'node_modules')
    ],
    alias: {
      App: projectPath
    }
  },

  context: resolve(__dirname, '..', '..', 'jfs-core', 'app'),
  entry: [resolve(projectPath, 'src', 'Main.tsx')],
  output: {
    filename: 'bundle.js',
    path: resolve(projectPath, 'dist'),
    publicPath: ''
  },

  module: {
    rules: [
      typescriptRule,
      sassRule,
      jsonRule
    ],
  },
  performance: { hints: false },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve(projectPath, 'static', 'index.html'),
      inject: false
    }),
    new CopyWebpackPlugin(copyJobs)
  ]
};

module.exports.projectPath = projectPath;

module.exports.typescriptRule = typescriptRule;
module.exports.babelLoader = babelLoader;
module.exports.atLoader = atLoader;

module.exports.sassRule = sassRule;
module.exports.jsonRule = jsonRule;
