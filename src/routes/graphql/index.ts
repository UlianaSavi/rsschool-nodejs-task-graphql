import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql } from 'graphql';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const queryStr = req.body?.query;
      const variablesStr = req.body?.variables;
      const res = await graphql({
        schema: schema,
        source: queryStr,
        variableValues: variablesStr
      });

      // TODO: разобраться с типизацией UUID! и MemberTypeId! в query, а точнее:
      // выдает ошибку: "Variable \"$postId\" of type \"UUID!\" used in position expecting type \"String\"." - потому что думает, что variableValues - stringи
      // а должно быть UUID ---> соотв. нужно:
      // погуглить про проверки типизации в query -> попробовать реализовать через них
      if (res) {
        if (res.errors) {
          // console.log('HERE errors -----> ', res.errors.at(0));
        }
        return {...res};
      }
    }
  });
};

export default plugin;