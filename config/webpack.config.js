'use strict';

const webpack = require('webpack');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) => merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js',
  },
  resolve:{
    // https://webpack.js.org/configuration/resolve/#resolvefallback
    fallback: {
      "util": require.resolve("util/"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "process": require.resolve('process/browser'),
      "fs": false
    }
  },
  plugins:[
    // https://stackoverflow.com/questions/41359504/webpack-bundle-js-uncaught-referenceerror-process-is-not-defined
    new webpack.ProvidePlugin({
      process: "process/browser",
    })
  ],
  devtool: argv.mode === 'production' ? false : 'source-map'
});

module.exports = config;
