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
      const res = await graphql({
        schema: schema,
        source: queryStr, // строка на языке GraphQL, представляет собой запрашиваемую инфу
      });
      return {...res};
    }
  });
};
export default plugin;