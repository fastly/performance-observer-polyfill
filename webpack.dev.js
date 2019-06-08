const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
    open: true
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  output: {
    path: path.resolve(__dirname, 'dist')
  }
});
