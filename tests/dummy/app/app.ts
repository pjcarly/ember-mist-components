import Application from "@ember/application";
import Resolver from "./resolver";
//@ts-ignore
import loadInitializers from "ember-load-initializers";
//@ts-ignore
import config from "./config/environment";

const App = class DummyApplication extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
};

loadInitializers(App, config.modulePrefix);

export default App;
