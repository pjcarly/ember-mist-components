import Fragment from "ember-data-model-fragments/fragment";
import attr from "ember-data/attr";

export default class Geolocation extends Fragment {
  @attr("number")
  lat!: number;

  @attr("number")
  lng!: number;
}
