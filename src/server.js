const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const expressStaticGzip = require("express-static-gzip");

if (process.env.NODE_ENV === "development") {
  // running server locally in webpack development mode
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const configuration = require("../webpack.dev.config");
  const webpack = require("webpack");
  const webpackComplier = webpack(configuration);
  const webpackHotMiddleware = require("webpack-hot-middleware");

  app.use(
    webpackDevMiddleware(webpackComplier, configuration.devServer.devMiddleware)
  );

  app.use(webpackHotMiddleware(webpackComplier));
}

// telling express to serve our static files for the dist folder
// expressStaticGzip() is replacing express.static() to enable express server
// to send gzip compressed data if browser support is there
app.use(
  "/static",
  expressStaticGzip(
    path.resolve(__dirname, "../dist"),
    // this options is provided for brotli compression support
    {
      enableBrotli: true,
      // if brotli is supported by the borswer, use brotli or else fallback to gzip
      orderPreference: ["br", "gz"],
    }
  )
);

app.get("/", (req, res) => {
  const pathToHTML = path.resolve(__dirname, "../dist");
  const htmlContent = fs.readFileSync(`${pathToHTML}/index.html`, "utf-8");
  res.status(200).send(htmlContent);
});

app.listen(3000, () => {
  console.log("App running on http://localhost:3000");
});
