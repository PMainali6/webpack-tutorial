const commonConfig = require("./webpack.common.config");
const { merge } = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");

const devConfig = {
  // added an new entry point specifically for dev mode
  // index-dev.js makes use of webpack-hot-middleware to refresh the app
  entry: "./src/js/index-dev.js",
  mode: "development",
  output: {
    filename: "[name].[contenthash].js",
    // setting publicPath for running webpack locally in dev mode
    publicPath: "/static/",
  },
  // recommended for development mode, as the build time is less
  devtool: "eval-source-map",
  devServer: {
    port: 3000,
    static: {
      // we specific from where we are serving the static files from
      directory: path.resolve(__dirname, "dist"),
    },
    devMiddleware: {
      index: "index.html",
      // defaults to save the changes in memory
      writeToDisk: true,
    },
    client: {
      // show error full screen
      overlay: true,
    },
    // since we have hot reloading, live reload must be false
    liveReload: false,
  },
  module: {
    rules: [
      // added rules for CSS Modules to be processed
      {
        test: /\.css$/,
        include: /\.module\.css$/,
        use: [
          // for dev-mode, add the css inline inside <style></style>
          "style-loader",
          // loader to process Css
          {
            loader: "css-loader",
            options: {
              modules: {
                // for dev-mode, the name is the same as the css
                localIdentName: "[local]--[md4:hash:7]",
              },
            },
          },
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
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};

module.exports = merge(commonConfig, devConfig);
