const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

const fs = require('fs')
const sass = require('node-sass')
const postcss = require('postcss')
const cssnano = require('cssnano')({preset: 'default'})

// generating global css file https://github.com/sveltejs/sapper/issues/357
sass.render({
  file: './src/style/global.sass',
  indentedSyntax: true,
  outFile: './public/global.css'
}, function (error, result) {
  if (!error) {
    postcss([cssnano])
    .process(result.css, {
      from: './public/global.css',
      to: './public/global.css'
    })
    .then(result =>
      fs.writeFile('./public/global.css', result.css, function (err) {
        if (err) {
          console.log(err)
        }
      })
    )
  } else {
    console.log(error)
  }
})

module.exports = {
	entry: {
		bundle: ['./src/main.js']
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
	output: {
		path: __dirname + '/public',
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: true,
						hotReload: true
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
					prod ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader'
				]
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		})
	],
	devtool: prod ? false: 'source-map'
};
