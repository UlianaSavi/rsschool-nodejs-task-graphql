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
    // TODO: последний тест в мутациях ждет тебя :)
    async handler(req) {
      const queryStr = req.body?.query;
      const variablesStr = req.body?.variables;

      const res = await graphql({
        schema: schema,
        source: queryStr,
        variableValues: variablesStr
      });
      if (res) {
        if (res.errors) {
          console.log('You got errors -----> \n', res.errors.at(0));
        }
        return {...res};
      }
    }
  });
};

export default plugin;