import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql } from 'graphql';
import { UUIDType } from './types/uuid.js';

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
      console.log(UUIDType);
      const res = await graphql({
        schema: schema,
        source: queryStr,
        variableValues: variablesStr
      });

      if (res) {
        if (res.errors) {
          // console.log('HERE errors -----> ', res.errors.at(0));
        }
        console.log('1 HERE queryStr -----> ', queryStr);
        console.log('1 HERE variablesStr -----> ', variablesStr);
        // console.log('2 HERE res -----> ', res);
  
        return {...res};
      }
    }
  });
};

export default plugin;