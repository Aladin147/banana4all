const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/css', to: 'css' }, // Copy CSS folder
        { from: 'src/icons', to: 'icons' }, // Copy icons folder
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
  ],
  externals: {
    uxp: 'commonjs2 uxp',
    photoshop: 'commonjs2 photoshop',
    os: 'commonjs2 os',
  },
  resolve: {
    extensions: ['.js'],
  },
  target: 'web',
  devtool: 'cheap-source-map',
};
