/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Type } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { GetResult } from '@prisma/client/runtime/index.js';
import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

const prisma = new PrismaClient();

export const gqlResponse = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponse = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const MemberType = new GraphQLObjectType({
  name: 'memberType',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    discount: {
      type: GraphQLString
    },
    postsLimitPerMonth: {
      type: GraphQLString
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberType: {
      type: MemberType,
      args: { id: { type: GraphQLString }},
      async resolve(parent, args){
        if (args?.id) {
          const res = await prisma.memberType.findUnique({  // return member by id
            where: {
              id: args.id,
            }
          });
          return res;
        }
        return {};
      }
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      args: {},
      async resolve() {
        const res = await prisma.memberType.findMany();  // return all members
        return res;
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
