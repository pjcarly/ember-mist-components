import { assert } from "@ember/debug";
import { isEmpty } from "@ember/utils";
import { isNumeric } from "@getflights/ember-attribute-validations/utils";
import { AttributeInterface } from "@getflights/ember-attribute-validations/base-validator";
import Service from "@getflights/ember-attribute-validations/services/validator";

/**
 * Here we extend the Validator Service, and add Default validations for different types
 * This is specific to the mist platform logic, and should be manually chosen per application
 * By explicitly exporting this version of the ValidatorService
 * Compared to the one in the ember-attribute-validations addon, which is exported by default
 */
export default class ValidatorService extends Service {
  validatorsFor(attribute: AttributeInterface) {
    const validators = super.validatorsFor(attribute);

    switch (attribute.type) {
      case "url":
        validators.push(
          this.lookupValidator({
            type: "url",
            value: true,
            attribute: attribute,
          })
        );
        break;
      case "string":
        validators.push(
          this.lookupValidator({
            type: "max",
            value: 255,
            attribute: attribute,
          })
        );
        break;
      case "email":
        validators.push(
          this.lookupValidator({
            type: "max",
            value: 255,
            attribute: attribute,
          })
        );
        validators.push(
          this.lookupValidator({
            type: "email",
            value: true,
            attribute: attribute,
          })
        );
        break;
      case "number":
      case "price":
      case "percent": {
        const precision = parseInt(attribute.options?.precision + "");
        const decimals = parseInt(attribute.options?.decimals + "");

        assert(
          `Precision is required for attribute ${attribute.name} of type ${attribute.type}`,
          !isEmpty(precision)
        );
        assert(
          `Decimals is required for attribute ${attribute.name} of type ${attribute.type}`,
          !isEmpty(decimals)
        );
        assert(
          `Number precision not numeric for attribute ${attribute.name} of type ${attribute.type}`,
          isNumeric(precision)
        );
        assert(
          `Number decimals not numeric for attribute ${attribute.name} of type ${attribute.type}`,
          isNumeric(decimals)
        );
        // @ts-ignore
        assert(
          `Decimals cannot be larger than precision for attribute ${attribute.name} of type ${attribute.type}`,
          precision > decimals
        );

        validators.push(
          this.lookupValidator({
            type: "number",
            value: true,
            attribute: attribute,
          })
        );
        validators.push(
          this.lookupValidator({
            type: "precision",
            value: precision,
            attribute: attribute,
          })
        );
        if (decimals === 0) {
          validators.push(
            this.lookupValidator({
              type: "wholenumber",
              value: true,
              attribute: attribute,
            })
          );
        } else {
          validators.push(
            this.lookupValidator({
              type: "decimals",
              value: decimals,
              attribute: attribute,
            })
          );
        }
        break;
      }
      case "-mf-fragment$address":
        // We validate the address with the valid-address validator
        validators.push(
          this.lookupValidator({
            type: "validAddress",
            value: true,
            attribute: attribute,
          })
        );

        // Required validator does not work natively, we instead push the requiredAddress validator
        // if the required validator is presetn
        if (validators.some((validator) => validator.name === "required")) {
          validators.push(
            this.lookupValidator({
              type: "requiredAddress",
              value: true,
              attribute: attribute,
            })
          );
        }
        break;
    }

    return validators;
  }
}
