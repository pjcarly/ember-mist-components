import Service from '@ember/service';
import Store from 'ember-data/store';
import Model from 'ember-data/model';
import QueryParamsInterface from 'ember-mist-components/classes/query-params-interface';
import { inject as service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';
import { isBlank } from '@ember/utils';

interface SessionService {
  invalidate() : void;
  get(key: string) : any;
}

export default class LoggedInUserService extends Service {
  @service session!: SessionService;
  @service store!: Store;

  /**
   * A reference to the logged in user model
   */
  user ?: Model;

  @alias('session.isAuthenticated') isAuthenticated : boolean;

  /**
   * Loads the current user from the store, based on the user_id in the OAuth response
   * @param query Query Params where possible include query parameter will be taken from
   */
  loadCurrentUser(query?: QueryParamsInterface){
    const userId = this.session.get('data.authenticated.user_id');
    const options = {};

    if(!isBlank(query) && !isBlank(query.include)){
      options['include'] = query.include;
    }

    return this.store.loadRecord('user', userId, options)
    .then((user : Model) => {
      this.set('user', user);
    });
  }

  /**
   * Invalidates the session, and unsets the user
   */
  logOut(){
    this.set('user', null);
    this.session.invalidate();
  }
}
