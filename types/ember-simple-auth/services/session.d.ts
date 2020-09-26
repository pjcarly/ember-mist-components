import Service from "@ember/service";
import Evented from "@ember/object/evented";
import Transition from "@ember/routing/-private/transition";
import Store from "@ember-data/store";

interface Data {
  authenticated: {
    access_token: string;
    authenticator: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    token_type: "Bearer";
    user_id: string;
  };
}
declare module "ember-simple-auth/services/session" {
  export default class SessionService extends Service.extend(Evented) {
    /**
     * Triggered whenever the session is successfully authenticated. This happens
     * when the session gets authenticated via
     * {{#crossLink "SessionService/authenticate:method"}}{{/crossLink}} but also
     * when the session is authenticated in another tab or window of the same
     * application and the session state gets synchronized across tabs or windows
     * via the store (see
     * {{#crossLink "BaseStore/sessionDataUpdated:event"}}{{/crossLink}}).
     * When using the {{#crossLink "ApplicationRouteMixin"}}{{/crossLink}} this
     * event will automatically get handled (see
     * {{#crossLink "ApplicationRouteMixin/sessionAuthenticated:method"}}{{/crossLink}}).
     * @event authenticationSucceeded
     * @public
     */

    /**
     * Triggered whenever the session is successfully invalidated. This happens
     * when the session gets invalidated via
     * {{#crossLink "SessionService/invalidate:method"}}{{/crossLink}} but also
     * when the session is invalidated in another tab or window of the same
     * application and the session state gets synchronized across tabs or windows
     * via the store (see
     * {{#crossLink "BaseStore/sessionDataUpdated:event"}}{{/crossLink}}).
     * When using the {{#crossLink "ApplicationRouteMixin"}}{{/crossLink}} this
     * event will automatically get handled (see
     * {{#crossLink "ApplicationRouteMixin/sessionInvalidated:method"}}{{/crossLink}}).
     * @event invalidationSucceeded
     * @public
     */

    isAuthenticated: boolean;
    data: Data | null;
    store: Store;
    attemptedTransition: Transition;
    session: any;

    set(key: string, value: any): any;
    authenticate(
      authenticator: string,
      username: string,
      password: string,
      scope: string
    ): RSVP.Promise<any>;
    invalidate(...args: any): RSVP.Promise;
    authorize(...args: any[]): RSVP.Promise;
    requireAuthentication(
      transition: Transition,
      routeOrCallback: string | function
    ): boolean;
    prohibitAuthentication(routeOrCallback: string | function): boolean;
    handleAuthentication(routeAfterAuthentication: string);
    handleInvalidation(routeAfterInvalidation: string);
  }
}
