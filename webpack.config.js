const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const inProduction = (process.env.NODE_ENV === 'production');
const PurifyCSSPlugin = require('purifycss-webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin')

// the path(s) that should be cleaned
let pathsToClean = [
    'dist',
    'build'
]

// the clean options to use
let cleanOptions = {
    root: __dirname,
    exclude: ['shared.js'],
    verbose: true,
    dry: false
}

module.exports = {
    // entry: './src/main.js', or 
    entry: {
        app: [
            './src/main.js',
            './src/main.scss'
        ],
        vendor: ['jquery']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[chunkhash].js'
    },
    module: {
        rules: [{
                test: /\.s[ac]ss$/,
                use: ExtractTextPlugin.extract({
                    // use: ['css-loader', 'postcss-loader', 'sass-loader'], without image opt
                    use: [{
                            loader: 'css-loader',
                        },
                        'sass-loader'
                    ],
                    fallback: 'style-loader'
                })
            },

            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },

            {
              test: /\.(svg|eot|ttf|woff|woff2)$/,
              use: 'file-loader'
            },

            {
                test: /\.(png|jpe?g|gif)$/,
                loaders: [
                  {
                    loader: 'file-loader',
                    options: {
                        limit: 1000,
                        name: 'images/[name].[hash].[ext]'
                    }
                  },
                  'img-loader' // minimize
                ],
                
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.LoaderOptionsPlugin({
            minimize: inProduction
        }),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, '*.html')),
            minimize: inProduction
        }),
        new CleanWebpackPlugin(pathsToClean, cleanOptions),
        function() {
            this.plugin('done', stats => {
                require('fs').writeFileSync(
                    path.join(__dirname, 'dist/manifest.json'),
                    JSON.stringify(stats.toJson().assetsByChunkName)
                )
            })
        }
    ]
}

if (inProduction) {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    )
}