import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponse, gqlResponse, schema } from './schemas.js';
import { graphql } from "graphql";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponse,
      response: {
        200: gqlResponse,
      },
    },
    async handler(req) {
      const queryStr = req.body?.query;
      const res = (await graphql({
        schema: schema,
        source: queryStr,
      }));
      return {...res};
    },
  });

  fastify.route({
    url: '/:memberTypeId',
    method: 'POST',
    schema: {
      ...createGqlResponse,
      response: {
        200: gqlResponse,
      },
    },
    async handler(req) {
      const queryStr = req.body?.query;
      const res = (await graphql({
        schema: schema,
        source: queryStr,
      }));
      if (res === null) {
        throw fastify.httpErrors.notFound();
      }
      return {...res};
    },
  });
};

export default plugin;
