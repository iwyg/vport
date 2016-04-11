var path = require('path');
var webpack = require('webpack');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var loaders = [
  {
    test: /\.jsx?$/,
    exclude: '/node_modules',
    loader: 'babel',
    query: {
      cacheDirectory: true,
      sourceMap: true,
      presets: ['es2015', 'stage-0'],
      plugins: ['transform-object-rest-spread'],
    }
  },
];

var config = {
  context: path.resolve(__dirname, './src'),
  entry: {
    index: './index.js'
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: ['', '.js'],
  module: {
    loaders: loaders,
  },
};

module.exports = config;
