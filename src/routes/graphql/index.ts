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
      // const res = await graphql({});
      const queryStr = req.query as string;
      const res = (await graphql({
        schema: schema,
        source: queryStr,
      })).data
      return {...res};
    },
  });
};

export default plugin;
