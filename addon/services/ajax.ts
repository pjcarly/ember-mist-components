import BaseService from 'ember-ajax/services/ajax';
import Service from '@ember/service';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { getOwner } from '@ember/application';

export default class AjaxService extends BaseService {
  @service session!: Service;

  /**
   * We set the host from the config
   */
  @computed
  get host() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.apiHost;
  }

  /**
   * Get the endpoint from the config
   */
  @computed
  get endpoint() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.apiEndpoint;
  }

  /**
   * We set the authorization header from the session service
   */
  @computed('session.data.authenticated.access_token')
  get headers() {
    const headers: any = {};
    const access_token = this.get('session.data.authenticated.access_token');

    if(!isBlank(access_token)) {
      headers['Authorization'] = `Bearer ${access_token}`;
    }

    return headers;
  }
}
