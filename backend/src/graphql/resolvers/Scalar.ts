import { GraphQLError, GraphQLScalarType, Kind, ValueNode } from "graphql";
import _ from "lodash";

const PhoneNumberObjectScalar = new GraphQLScalarType({
  name: "PhoneObjectNumber",
  description:
    "Phone Object Number scalar contains code, number and country to present a phone number. Format: {code, number, country}",
  serialize(value: unknown) {
    if (typeof value !== "object") {
      throw new TypeError(`Value is not object: ${value}`);
    }
    const { code, number, country }: any = _.pick(value, ["code", "number", "country"]);
    if (!code || typeof code !== "string") {
      throw new TypeError("Value must contain key code as a string");
    }
    if (!number || typeof number !== "string") {
      throw new TypeError("Value must contain key number as a string");
    }
    if (!!country && typeof country !== "string") {
      throw new TypeError("Value must contain key country as a string");
    }
    return value;
  },
  parseValue(value: unknown) {
    if (typeof value !== "object") {
      throw new TypeError(`Value is not object: ${value}`);
    }
    const { code, number, country }: any = _.pick(value, ["code", "number", "country"]);
    if (!code || typeof code !== "string") {
      throw new TypeError("Value must contain key code as a string");
    }
    if (!number || typeof number !== "string") {
      throw new TypeError("Value must contain key number as a string");
    }
    if (!!country && typeof country !== "string") {
      throw new TypeError("Value must contain key country as a string");
    }
    return value;
  },
  parseLiteral(ast: ValueNode) {
    if (ast.kind !== Kind.OBJECT) {
      throw new GraphQLError(`Can only validate object as phone number object but got a: ${ast.kind}`);
    }

    let code, number, country;
    if ("value" in ast) {
      code = _.get(ast, "value.code");
      number = _.get(ast, "value.number");
      country = _.get(ast, "value.country");
    } else if (ast.fields) {
      code = _.get(
        ast.fields.find((field) => _.get(field, "name.value") === "code"),
        "value.value"
      );
      number = _.get(
        ast.fields.find((field) => _.get(field, "name.value") === "number"),
        "value.value"
      );
      country = _.get(
        ast.fields.find((field) => _.get(field, "name.value") === "country"),
        "value.value"
      );
    }
    if (!code || typeof code !== "string") {
      throw new GraphQLError("Value must contain key code as a string");
    }
    if (!number || typeof number !== "string") {
      throw new GraphQLError("Value must contain key number as a string");
    }
    if (!!country && typeof country !== "string") {
      throw new GraphQLError("Value must contain key country as a string");
    }
    return { code, number, country };
  },
});

export default {
  PhoneNumberObject: PhoneNumberObjectScalar,
};
