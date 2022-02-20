import Transition from "@ember/routing/-private/transition";
import ChangeTrackerModel from "../models/change-tracker-model";
import SingleModelRoute from "./single-model-route";

export default abstract class ModelEditRoute extends SingleModelRoute {
  async afterModel(model: ChangeTrackerModel, transition: Transition) {
    await super.afterModel(model, transition);

    model.startTrack();
  }
}
