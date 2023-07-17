// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Type } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

const prisma = new PrismaClient();

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
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

const PostType = new GraphQLObjectType({
  name: 'posts',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    title: {
      type: GraphQLString
    },
    content: {
      type: GraphQLString
    }
  })
});

const UsersType = new GraphQLObjectType({
  name: 'users',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    balance: {
      type: GraphQLString
    }
  })
});
const ProfilesType = new GraphQLObjectType({
  name: 'profiles',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    isMale: {
      type: GraphQLString
    },
    yearOfBirth: {
      type: GraphQLString
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      args: {},
      async resolve() {
        const res = await prisma.memberType.findMany();  // return all members
        return res;
      }
    },
    memberType: {
      type: MemberType,
      args: { id: { type: GraphQLString }},
      async resolve(parent, args: { id: string}){
        if (args?.id) {
          const res = await prisma.memberType.findUnique({  // return member by id
            where: {
              id: args.id || "basic"
            }
          });
          return res;
        }
        return {};
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      args: {},
      async resolve() {
        const res = await prisma.post.findMany();
        return res;
      }
    },
    post: {
      type: PostType,
      args: { id: { type: GraphQLString }},
      async resolve(parent, args: { id: string}){
        if (args?.id) {
          const res = await prisma.post.findUnique({
            where: {
              id: args.id,
            }
          });
          return res;
        }
        return {};
      }
    },
    users: {
      type: new GraphQLList(UsersType),
      args: {},
      async resolve() {
        const res = await prisma.user.findMany();
        return res;
      }
    },
    user: {
      type: UsersType,
      args: { id: { type: GraphQLString }},
      async resolve(parent, args: { id: string}){
        if (args?.id) {
          const res = await prisma.user.findUnique({
            where: {
              id: args.id,
            }
          });
          return res;
        }
        return {};
      }
    },
    profiles: {
      type: new GraphQLList(ProfilesType),
      args: {},
      async resolve() {
        const res = await prisma.profile.findMany();
        return res;
      }
    },
    profile: {
      type: ProfilesType,
      args: { id: { type: GraphQLString }},
      async resolve(parent, args: { id: string}){
        if (args?.id) {
          const res = await prisma.profile.findUnique({
            where: {
              id: args.id,
            }
          });
          return res;
        }
        return {};
      }
    },
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
