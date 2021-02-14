import Application from "@ember/application";
import FragmentSerializer from "../serializer/FragmentSerializer";

export function initialize(application: Application) {
  application.register("serializer:-fragment", FragmentSerializer);
}

export default {
  name: "fragment-serializer",
  initialize: initialize,
};
