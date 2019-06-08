const fs = require('fs');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

function getLicenseWithDate() {
   const license = fs.readFileSync(path.resolve(__dirname, 'LICENSE'), { encoding: 'utf8'});
   const year = new Date(Date.now()).getFullYear();
   const version = require("./package.json").version;
   return license.replace('[year]', year).replace('[version]', version);
}

module.exports = [
	merge(common, {
	   mode: 'production',
	   entry: './src/index.ts',
	   plugins: [
		  new CleanWebpackPlugin(),
		  new webpack.BannerPlugin({
			 banner: getLicenseWithDate()
		  }),
		  new BundleAnalyzerPlugin({
			 analyzerMode: 'static'
		  })
	   ],
	   output: {
		  path: path.resolve(__dirname, 'dist')
	   }
	}),
	merge(common, {
	   mode: 'production',
	   entry: './polyfill/index.ts',
	   plugins: [
		  new webpack.BannerPlugin({
			 banner: getLicenseWithDate()
		  }),
		  new BundleAnalyzerPlugin({
			 analyzerMode: 'static'
		  })
	   ],
	   output: {
		  path: path.resolve(__dirname, 'polyfill')
	   }
	})
];
