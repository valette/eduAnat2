
module.exports = {
  mode: 'development',
  entry: __dirname + '/node_modules/desk-ui/source/bundleIndex.js',

  output: {
    path: __dirname + '/compiled/source/eduAnat2/',
    filename: 'bundle.js'
  },

 resolve: {
    modules: [
      "node_modules",
      __dirname,
    ],
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
      }

    ]
  },

  externals: {
    fs: "require('fs')"
}};
