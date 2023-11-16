const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const commonConfig = {
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      // to make sure of template.html
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    // to generate our html files & include the script && css files automatically
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/template.html",
    }),

    // since the output.clean has some issues removing the exisiting files
    // we use this plugin
    new CleanWebpackPlugin({}),
    // copies images from /images folder into dist
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "images/motivational-pictures/*.*",
        },
      ],
    }),
  ],
};

module.exports = commonConfig;
