const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const resolve = dir => path.resolve(__dirname, dir);

const webpackConfig = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: resolve('./dist'),
        filename: 'cl-crud.min.js',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.styl$/,
                loaders: ['style-loader', 'css-loader', 'stylus-loader']
            }
        ]
    },
    plugins: [new VueLoaderPlugin()],
    resolve: {
        alias: {
            '@': resolve('src')
        }
    }
};

module.exports = webpackConfig;
