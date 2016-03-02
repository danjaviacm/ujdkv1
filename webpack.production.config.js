const path = require( 'path' )
const CopyWebpackPlugin = require('copy-webpack-plugin')
const node_modules = path.resolve( __dirname, 'node_modules' )
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require( "webpack" )

const PATHS = {
	app: path.resolve(__dirname, 'ujdk.js' ),
	build: path.resolve(__dirname, 'dist' )
}

NODE_ENV='production'

module.exports = {

	entry: PATHS.app,

	output: {
		path: PATHS.build,
		filename: 'ujdk-[hash].js',
    	hash: true
	},

	// For joi libs
	node: {
      net: 'empty',
      tls: 'empty',
      dns: 'empty'
    },

	module: {
		loaders: [
			{
				test: /\.(jsx|es6|js)?$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel', // 'babel-loader' is also a legal name to reference
				query: {
					presets: [ 'es2015' ]
				}
			},

			// BOOTSTRAP && OUR FONTS
			{ test: /\.(ttf|eot|svg|woff|woff2?)(\?[a-z0-9]+)?$/, loader : 'file-loader?name=font/[name].[ext]' },

			{ test: /\.eot(\?-[a-z0-9]+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream&name=font/[name].[ext]" },

			// FONT AWESOME FONTS
			{ test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff&name=font/[name].[ext]" },

			{ test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff&name=font/[name].[ext]" },

			{ test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream&name=font/[name].[ext]" },

			{ test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=100000&name=font/[name].[ext]" },

			{ test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml&name=font/[name].[ext]" },

			// IMAGES
			{ test: /\.(png|jpg)$/, loader: 'url?limit=25000&name=images/[name].[ext]' },

			// LESS
            // { test: /\.less$/, loader: "style!css!less" },

            { test: /\.less$/, loader: ExtractTextPlugin.extract("css-loader!autoprefixer-loader!less-loader")},

			// SASS
			{ test: /\.scss$/, loader: 'style!css!sass'	}
		]
	}
};
