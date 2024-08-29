const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  devServer: {
    compress: true,
    port: 9000,
    open: true,
  },
  entry: {
    index: './src/index.js',
    'service-worker': './src/service-worker.js',
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new MiniCssExtractPlugin({
      filename: './src/css/[name].css',
      chunkFilename: '[id].css',
    }),
    // new InjectManifest({
    //   swSrc: './src/service.worker.js',
    //   swDest: 'service.worker.js',
    //   include: [/\.html$/, /\.js$/, /\.css$/],
    // }),
  ],
};
