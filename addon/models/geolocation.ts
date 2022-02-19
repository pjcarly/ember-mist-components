import { attr } from "@ember-data/model";
// @ts-ignore
import Fragment from "ember-data-model-fragments/fragment";

export default class Geolocation extends Fragment {
  @attr("number")
  lat!: number;

  @attr("number")
  lng!: number;
}
