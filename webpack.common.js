const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin'); 

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
          globOptions: {
            ignore: ['**/index.html'], 
          },
        },
      ],
    }),
    new GenerateSW({
      swDest: 'sw.js', 
      clientsClaim: true,
      skipWaiting: true,

      runtimeCaching: [
        //
        // ATURAN UNTUK 'story-api.dicoding.dev/stories'
        // TELAH DIHAPUS DARI SINI UNTUK MEMPERBAIKI ERROR 405
        //
        
        {
          urlPattern: new RegExp('^https://fonts.googleapis.com/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets',
          },
        },
        {
          urlPattern: new RegExp('^https://fonts.gstatic.com/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
            urlPattern: new RegExp('^https://(cdn.rawgit.com|cdnjs.cloudflare.com|tile.openstreetmap.org)/'),
            handler: 'CacheFirst',
            options: {
                cacheName: 'leaflet-cache',
                expiration: {
                    maxAgeSeconds: 60 * 60 * 24 * 30, 
                },
            },
        }
      ],
      importScripts: [
        '/sw-push-listener.js',
      ],
    }),
  ],
};