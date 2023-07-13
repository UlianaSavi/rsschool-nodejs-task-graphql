import { Type } from '@fastify/type-provider-typebox';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

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
  fields: {
    id: {
      type: GraphQLString
    },
    discount: {
      type: GraphQLString
    },
    postsLimitPerMonth: {
      type: GraphQLString
    }
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    book: {
      type: MemberType,
      args: { id: { type: GraphQLString }},
      resolve(parent, args){
        // args.id
        // here will be getting data from db
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
