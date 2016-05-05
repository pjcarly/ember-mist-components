module.exports = {
    // Fix: https://github.com/ember-cli/ember-cli/pull/3846/files
    normalizeEntityName: function (entityName) {
        return entityName;
    }
    // afterInstall: function () {
    //     var addBowerPackageToProject = this.addBowerPackageToProject.bind(this);
    //
    //     return addBowerPackageToProject('material-design-lite', '^1.1.3');
    // }
};
