import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql } from 'graphql';
import { depthLimitValidate } from './validators/depthLimitValidate.js';
import { createLoaders } from './types/dataLoader.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { postsDataloader, memberTypesDataloader, profilesByIdDataloader, profilesDataloader } = await createLoaders(fastify);

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
      const MAX_QUERY_DEPTH = 5;

      const depthQueryError = depthLimitValidate(queryStr, schema, MAX_QUERY_DEPTH);

      if(depthQueryError) {
        const message = `exceeds maximum operation depth of ${ MAX_QUERY_DEPTH }`
        return {
          errors: [
            {
              message: message,
            },
          ],
        }
      }

      const res = await graphql({
        schema: schema,
        source: queryStr,
        variableValues: variablesStr,
        contextValue: {
          fastify,
          postsDataloader,
          profilesDataloader,
          profilesByIdDataloader,
          memberTypesDataloader
        },
      });

      return { ...res };
    },
  });
};

export default plugin;