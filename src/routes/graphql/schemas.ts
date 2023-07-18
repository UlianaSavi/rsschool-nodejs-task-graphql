/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Type } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { GraphQLEnumType, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { UUIDType } from './types/uuid.js';

const prisma = new PrismaClient();

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object({
    query: Type.String(),
    variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
  }, {
    additionalProperties: false,
  }, ),
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

const SubscribedToUserType = new GraphQLObjectType({
  name: 'subscribedToUser',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    userSubscribedTo: {
      type: UserSubscribedToType,
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            authorId: parent.id
          }
        });
        console.log('1here', res.at(0));
        
        return res.at(0)?.authorId ? { id: res.at(0)?.authorId } : [];
      }
    }
  })
});

const UserSubscribedToType = new GraphQLObjectType({
  name: 'userSubscribedTo',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    subscribedToUser: {
      type: SubscribedToUserType,
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            subscriberId: parent.id
          }
        });
        console.log('2here', res.at(0));
        
        return res.at(0)?.subscriberId ? { id: res.at(0)?.subscriberId } : [];
      }
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
    },
    profile: {
      type: ProfilesType,
      async resolve(parent, args) {
        const res = await prisma.profile.findUnique({
          where: {
            userId: parent.id
          }
        });
        console.log('3here', res?.id);
        
        return res?.id ? res : null;
      }
    },
    posts: {
      type: PostType,
      async resolve(parent, args) {
        const res = await prisma.post.findMany({
          where: {
            authorId: parent.id
          }
        });
        console.log('4here', res.at(0));
        
        return res.at(0)?.id ? res : null;
      }
    },
    userSubscribedTo: {
      type: UserSubscribedToType,
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            authorId: parent.id
          }
        });
        console.log('5here', res.at(0));
        
        return res.at(0)?.authorId ? { id: res.at(0)?.authorId } : null;
      }
    },
    subscribedToUser: {
      type: SubscribedToUserType,
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            subscriberId: parent.id
          }
        });
        console.log('6here', res.at(0));
        
        return res.at(0)?.subscriberId ? { id: res.at(0)?.subscriberId } : null;
      }
    },
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
    },
    memberType: {
      type: MemberType,
      async resolve(parent, args) {
        const res = await prisma.memberType.findMany({
          where: {
            id: args.id,
          }
        });
        console.log('7here', res.at(0));
        
        return res.at(0)?.id ? res.at(0) : null;
      }
    }
  })
});

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'basic' },
    BUSINESS: { value: 'business'},
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      args: {},
      async resolve() {
        const res = await prisma.memberType.findMany(); // return all members
        console.log('8here', res.at(0));
        
        return res.at(0)?.id ? res : null;
      }
    },
    memberType: {
      type: MemberType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      async resolve(parent, args: { id: string }) {
        const res = await prisma.memberType.findUnique({ // return member by id
          where: {
            id: args.id,
          }
        });
        console.log('9here', res?.id);
        
        return res?.id ? res : null;
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      args: {},
      async resolve() {
        const res = await prisma.post.findMany();
        console.log('10here', res.at(0));
        
        return res.at(0)?.id ? res : null;
      }
    },
    post: {
      type: PostType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      async resolve(parent, args: {
        id: string
      }) {
        const res = await prisma.post.findUnique({
          where: {
            id: args.id,
          }
        });
        console.log('11here', res?.id);
        
        return res?.id ? res : null;
      }
    },
    users: {
      type: new GraphQLList(UsersType),
      args: {},
      async resolve() {
        const res = await prisma.user.findMany();
        console.log('12here', res.at(0));
        
        return res.at(0)?.id ? res : null;
      }
    },
    user: {
      type: UsersType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      async resolve(parent, args: {
        id: string
      }) {
        const res = await prisma.user.findUnique({
          where: {
            id: args.id,
          }
        });
        console.log('13here', res?.id);
        
        return res?.id ? res : null;
      }
    },
    profiles: {
      type: new GraphQLList(ProfilesType),
      args: {},
      async resolve() {
        const res = await prisma.profile.findMany();
        console.log('14here', res.at(0));
        
        return res.at(0)?.id ? res : null;
      }
    },
    profile: {
      type: ProfilesType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      async resolve(parent, args: {
        id: string
      }) {
        const res = await prisma.profile.findUnique({
          where: {
            id: args.id,
          }
        });
        console.log('15here', res?.id);
        
        return res?.id ? res : null;
      }
    },
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  types: [UUIDType, MemberTypeId]
});
