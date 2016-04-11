var webpack = require('webpack');
var config = require('./webpack.dev.js');
var WebpackDevServer = require('webpack-dev-server');

new WebpackDevServer(webpack(config), {
  contentBase: 'build/',
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true

}).listen(1337, 'localhost', function (err, res) {
  if (err) {
    console.log(err);
  }
  console.log(res);
});
