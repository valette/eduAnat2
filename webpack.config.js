
module.exports = {
  mode: 'development',
  entry: __dirname + '/source/bundleIndex.js',

  output: {
    path: __dirname + '/source/resource/webpack-bundle',
    filename: 'bundle.js'
  },

 resolve: {
    modules: [
      "node_modules",
      __dirname,
    ],
    fallback: {
      "buffer": require.resolve("buffer"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify")
    }
  },

  module : {
    rules:[
      {
        test: /\workerSlicer.worker.js$/,
        use: [ { loader: 'script-loader' } ]
      },
      {
        test: /\.css$/,
        use: [ "style-loader", "css-loader"]
      },
      {
        test: /\.js$|\.mjs$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      }
    ]
  },

  externals: {
    fs: "require('fs')"
}};
