import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { TestContext } from "ember-test-helpers";
import RouteIsActiveHelper from "dummy/helpers/route-is-active";

module("Unit | Helper | route-is-active", function (hooks) {
  setupTest(hooks);

  test("Helper Test", async function (this: TestContext, assert) {
    const helper = RouteIsActiveHelper.create();
    console.log(helper);
  });
});
