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
      const res = await graphql({
        schema: schema,
        source: queryStr, // строка на языке GraphQL, представляет собой запрашиваемую инфу
      });

      // TODO: перенеси то, что ниже в schema, там сейчас есть подобное, но возвращается null (скорее всего из-за неправильного юза промисов)
      const data2 = await fastify.prisma.memberType.findUnique({
        where: {
          id: "basic",
        }
      }).then((res) => { return res });
      console.log('HERE HAVE DATA (member by id) -----> ', data2);
      return {...res};
    }
  });
};
export default plugin;