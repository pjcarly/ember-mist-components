// import Fragment from "ember-data-model-fragments/fragment";
import { attr } from "@ember-data/model";
import EmberObject from "@ember/object";

export default class Geolocation extends EmberObject {
  @attr("number")
  lat!: number;

  @attr("number")
  lng!: number;
}
