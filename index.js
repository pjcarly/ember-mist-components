"use strict";

const MergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');

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
  treeForPublic() {
    let publicTree = this._super.treeForPublic.apply(this, arguments);

    let trees = [];

    if (publicTree && hasFastBoot) {
      trees.push(publicTree);
    }

    trees.push(new Funnel('node_modules/intl-tel-input/build/js', { 
      include: ['utils.js'], 
      getDestinationPath(relativePath) {
        if(relativePath === 'utils.js') {
          return 'phone-utils.js';
        }
      },
      destDir: 'assets'}));

    return new MergeTrees(trees);
  }
};
