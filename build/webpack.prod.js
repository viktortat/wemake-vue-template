'use strict'
process.env.NODE_ENV = 'production'

const webpack = require('webpack')
const merge = require('webpack-merge')
const analyzer = require('webpack-bundle-analyzer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const CompressionPlugin = require('compression-webpack-plugin')
const base = require('./webpack.base')
const _ = require('./utils')

// Extract css in standalone css files
const styleLoaders = []
_.cssProcessors.forEach(processor => {
  let loaders
  if (processor.loader === '') {
    loaders = ['postcss-loader']
  } else {
    loaders = ['postcss-loader', processor.loader]
  }
  styleLoaders.push({
    test: processor.test,
    loader: ExtractTextPlugin.extract({
      use: [_.cssLoader].concat(loaders),
      fallback: 'style-loader'
    })
  })
})

module.exports = merge(base, {
  output: {
    // Use hash filename to support long-term caching
    filename: '[name].[chunkhash:8].js'
  },

  module: {
    loaders: [
      ...styleLoaders
    ]
  },

  devtool: 'source-map',

  plugins: [
    // Analyze and visualize webpack bundle size:
    new analyzer.BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    }),

    new ProgressPlugin(),
    new ExtractTextPlugin('styles.[contenthash:8].css'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),

    // webpack@3 dark magic:
    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    // Extract vendor chunks
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => {
        return module.resource && /\.(js|css|es6)$/.test(module.resource) && module.resource.indexOf('node_modules') !== -1
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),

    // Create .gz files:
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8
      // deleteOriginalAssets: true
    })
  ],

  // Minimize webpack output
  stats: {
    // Add children information
    children: false,
    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: false,
    // Add built modules information to chunk information
    chunkModules: false,
    chunkOrigins: false,
    modules: false
  }
})
