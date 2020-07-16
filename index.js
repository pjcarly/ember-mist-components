"use strict";

module.exports = {
  name: require("./package").name,
  isDevelopingAddon() {
    return true;
  },
  contentFor(type, config) {
    if (config.environment !== "test" && type === "body") {
      return '<div id="ember-mist-modal-wormhole"></div>';
    }
  },
};
