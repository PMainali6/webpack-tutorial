const commonConfig = require("./webpack.common.config");
const { merge } = require("webpack-merge");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const glob = require("glob");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const prodConfig = {
  entry: "./src/js/index.js",
  mode: "production",
  output: {
    filename: "js/[name].[contenthash:12].js",
    // setting publicPath static to serve files from express server
    publicPath: "/static/",
  },
  // recommended for prod build, as useful in prod setting to debug
  // devtool: "source-map",
  optimization: {
    minimize: true,
    // tree shaking => dead code elimination
    // usedExports only works if the its ES Modules
    // it examines weather the exported function or class is getting used
    // if not it removes the these functions or class for the the final bundle
    // in the production mode
    usedExports: true,
    minimizer: [
      // use existing plugins as it is
      `...`,
      // by default css is not optimized in prod mode,
      // this plugin helps minify, removeComments from css
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["imagemin-mozjpeg", { quality: 40 }],
              [
                "imagemin-pngquant",
                {
                  quality: [0.65, 0.9],
                  speed: 4,
                },
              ],
              [
                "imagemin-svgo",
                {
                  plugins: [
                    {
                      name: "preset-default",
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                {
                                  xmlns: "http://www.w3.org/2000/svg",
                                },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
        // added this for converting jpg / png images into webp
        // as the files are copied by CopyWebpackPlugin
        generator: [
          {
            type: "asset",
            preset: "webp-custom-name",
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ["imagemin-webp"],
            },
          },
        ],
      }),
    ],
    // this creates a single runtimejs file in the dist
    // to be shared for all generated chunks
    runtimeChunk: "single",
    // config for creating different chunks
    splitChunks: {
      /* chunks values ===
          "async" => lazy loading chunks
                      they will not be referenced in the html page

          "initial" => chunks loaded at the initial page load, 
                        they will be added in html

          "all" => both async & non-async
      */
      chunks: "all",
      maxSize: Infinity,
      // minSize that a chunk must be
      // here a chunk must be a minSize of 2000 bytes
      minSize: 2000,
      cacheGroups: {
        async: {
          test: /[\\/]node_modules[\\/]/,
          chunks: "async",
          name(module, chunks) {
            return chunks.map((chunk) => chunk.name).join("-");
          },
        },
        // lodash: {
        //   test: /[\\/]node_modules[\\/]lodash-es[\\/]/,
        //   chunks: "initial",
        //   name: "lodash-es",
        // },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: "initial",
          name: "vendors",
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: /\.module\.css$/,
        use: [
          // to extract css into seperate file
          MiniCssExtractPlugin.loader,
          // loader to process CSS
          {
            loader: "css-loader",
            options: {
              // for css modules
              modules: {
                localIdentName: "[hash:base64]",
              },
            },
          },
          // postcss loader added
          // config is defined in postcss.config.js
          // .browserslistrc => has the supported browsers list
          "postcss-loader",
        ],
      },
      {
        test: /\.(jpg|png|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            // for imageSize < 10 KB the image will be inlined
            // if imageSize > 10 KB the image will be added as a resouces
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: "./images/[name].[ext]",
        },
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name]:[contenthash:12].css",
    }),

    // purgecss to remove unused css from the existing css like bootstrap
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, { nodir: true }),
    }),

    // adding support for gzip compression
    // this plugin will generate additional *.gz files along with *.js, *.css files
    // in the build process
    new CompressionPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.(js|css)$/,
    }),

    // adding support for brotli compression
    // brotli support compression level from 1 to 11
    // level 1 is fastest but less compressed
    // level 11 is slowest but most compressed
    new CompressionPlugin({
      filename: "[path][base].br",
      test: /\.(js|css)$/,
      algorithm: "brotliCompress",
      compressionOptions: { level: 11 },
    }),
  ],
};

module.exports = merge(commonConfig, prodConfig);
