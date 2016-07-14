import EmberUploader from 'ember-uploader';

export default EmberUploader.FileField.extend({
  session: Ember.inject.service(),

  filesDidChange: function(files) {
    let config = Ember.getOwner(this).resolveRegistration('config:environment');
    let session = this.get('session');
    let authHeader;

    session.authorize('authorizer:oauth2', (headerName, headerValue) => {
      authHeader = headerValue;
    });

    var uploader = EmberUploader.Uploader.extend({
      url: `${config.apiEndpoint}model/files`,
      type: 'POST',
      ajaxSettings: {
        headers: {
          'Authorization': authHeader
        }
      }
    }).create();

    if (!Ember.isEmpty(files)) {
      // this second argument is optional and can to be sent as extra data with the upload
      uploader.upload(files[0]);
    }
  }
});
