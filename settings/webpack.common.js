const { resolve, join } = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const projectPath = resolve(__dirname, '..', '..', '..', '..');

const copyJobs = [
  { from: resolve(projectPath, 'static') },
  { from: resolve(projectPath, 'config.json.dist'),
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

  context: resolve(__dirname, '..', 'app'),
  entry: ['./Main.tsx'],
  output: {
    filename: 'bundle.js',
    path: resolve(projectPath, 'dist'),
    publicPath: ''
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['react', ['es2015', { modules: false, loose: true }]],
              plugins: ['transform-runtime', 'lodash']
            }
          },
          'awesome-typescript-loader'
        ]
      },
      {
        test: /\.s*css$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      }
    ],
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
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
