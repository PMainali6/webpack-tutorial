import "webpack-hot-middleware/client";
import { renderApp } from "./index";

if (module.hot) {
  module.hot.accept("./index.js", function () {
    console.log("Accepting the updated index.js module");
    renderApp();
  });
}
