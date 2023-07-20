import { GraphQLError, GraphQLSchema, parse, validate } from "graphql";
import depthLimit from 'graphql-depth-limit';

export const depthLimitValidate = (query: string, schema: GraphQLSchema, dLimit: number): GraphQLError | null => {
  const document = parse(query);
  const validationErrors = validate(schema, document, [depthLimit(dLimit)]);
  const resError = validationErrors.find(
    (error) => error.name === 'GraphQLError' && error.message.includes('exceeds maximum operation depth')
  ) || null;
  return resError;
};