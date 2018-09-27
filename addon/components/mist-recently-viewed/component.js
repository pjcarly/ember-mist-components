import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['card recently-viewed'],
  storage: service(),
  recentlyViewedRecords: computed('storage.recentlyViewedRecords', function(){
    const recentlyViewedRecords = this.get('storage.recentlyViewedRecords');
    if(isBlank(recentlyViewedRecords)){
      return [];
    } else {
      return recentlyViewedRecords;
    }
  })
})
