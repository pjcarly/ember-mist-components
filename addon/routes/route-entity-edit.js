import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ResetControllerMixin from 'ember-field-components/mixins/route-reset-controller';
import SingleEntityRouteMixin from 'ember-mist-components/mixins/route-single-entity';
import ScrollToTop from 'ember-mist-components/mixins/route-scroll-to-top';

const { Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, ResetControllerMixin, SingleEntityRouteMixin, ScrollToTop);
