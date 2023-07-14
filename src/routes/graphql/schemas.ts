/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Type } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

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
  name: 'member',
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
    member: {
      type: MemberType,
      args: { id: { type: GraphQLString }},
      async resolve(args){
        if (args?.id) {
          const res = prisma.memberType.findUnique({  // return member by id
            where: {
              id: args.id,
            }
          }).then((data) => {
            return data;
          });
          return res;
        }
        return null;
      }
    },
    memberTypes: {
      type: MemberType,
      args: {},
      async resolve(){
        const data = await prisma.memberType.findMany().then((res) => { return res });
        return data;
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
