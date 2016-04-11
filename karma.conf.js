var path = require('path');
var webpackConfig = require('./webpack.dev.js');

var entry = path.resolve(__dirname, './tests/*.test.js');
var preprocessors = {
  [entry]: ['webpack']
};

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
var ci = process.env.NODE_ENV === 'test:ci';
var coverage = process.env.COVERAGE === true;

if (coverage) {
  console.log('-- recording coverage --');
}

var getReporters = function () {
  var reps = ['progress'];
  if (coverage) {
    reps.push('coverage');
  }
  return reps;
};

module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: ['jasmine'],
    files: [entry],
    preprocessors: preprocessors,
    reporters: getReporters(),
    webpack: webpackConfig,
    browsers: ['Firefox', 'Chrome'],
    webpackMiddleware: {noInfo: true},
    coverageReporter: {
      reporters: [
        {type: 'lcov', dir: 'coverage/', subdir: '.'},
        {type: 'json', dir: 'coverage/', subdir: '.'},
        {type: 'text-summary'}
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autowatch: !ci,
    singleRun: ci,
    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ]
  });
};
