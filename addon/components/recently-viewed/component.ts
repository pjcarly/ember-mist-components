import Component from '@ember/component';
import RecentlyViewedService from 'dummy/services/recently-viewed';
import { inject as service } from '@ember-decorators/service';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class RecentlyViewedComponent extends Component {
  @service recentlyViewed !: RecentlyViewedService;
}
