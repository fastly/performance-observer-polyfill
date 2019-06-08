const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      },
      {
        test: /\.ts$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Performance Observer Polyfill'
    })
  ],
  output: {
    library: 'PerformanceOberserverPolyfill',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  }
};
