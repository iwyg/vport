var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var WebpackDevServer = require('webpack-dev-server');
var _ = require('lodash');

module.exports = _.merge(webpackConfig, {
  devtool: ['eval-source-map'],
  entry: [
    'webpack-dev-server/client?http://localhost:1337',
    'webpack/hot/dev-server',
    './index.js'
  ],
  output: {
    sourceMapFilename: '[file].map'
  },
  plubgins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
});
