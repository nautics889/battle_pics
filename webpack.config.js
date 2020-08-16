const path = require('path');
const webpack = require('webpack');
module.exports = {
  entry: {
    index:'./src/index.js'
  },
  output: {
    filename: 'bundled.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath:'./'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: ["style-loader","css-loader"]
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader:"file-loader",
        options:{
          name:'[name].[ext]',
          outputPath:'assets/'
          //the images will be emited to dist/assets/images/ folder
        }
      }
    ]
  },
  plugins: [
    /* Use the ProvidePlugin constructor to inject jquery implicit globals */
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery'",
        "window.$": "jquery"
    })
  ]
};
