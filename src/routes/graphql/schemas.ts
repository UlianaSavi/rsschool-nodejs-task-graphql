/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Type } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInputObjectType, GraphQLNonNull, GraphQLBoolean, GraphQLInt, GraphQLFloat } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from './types/memberTypeId.js';

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
      type: UUIDType
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
      type: UUIDType
    },
    userSubscribedTo: {
      type: new GraphQLList(UserSubscribedToType),
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            subscriberId: parent.id
          }
        });
        
        return res.at(0)?.authorId ? [{ id: res.at(0)?.authorId }] : [];
      }
    }
  })
});

const UserSubscribedToType = new GraphQLObjectType({
  name: 'userSubscribedTo',
  fields: () => ({
    id: {
      type: UUIDType
    },
    subscribedToUser: {
      type: new GraphQLList(SubscribedToUserType),
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            authorId: parent.id
          }
        });
        
        return res.at(0)?.subscriberId ? [{ id: res.at(0)?.subscriberId }] : [];
      }
    }
  })
});

const UsersType = new GraphQLObjectType({
  name: 'users',
  fields: () => ({
    id: {
      type: UUIDType
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
        
        return res?.id ? res : null;
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args) {
        const res = await prisma.post.findMany({
          where: {
            authorId: parent.id
          }
        });
        
        return res.at(0)?.id ? res : null;
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(UserSubscribedToType),
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            subscriberId: parent.id
          }
        });
        
        return res.at(0)?.authorId ? [{ id: res.at(0)?.authorId }] : [];
      }
    },
    subscribedToUser: {
      type: new GraphQLList(SubscribedToUserType),
      async resolve(parent, args) {
        const res = await prisma.subscribersOnAuthors.findMany({
          where: {
            authorId: parent.id
          }
        });
        
        return res.at(0)?.subscriberId ? [{ id: res.at(0)?.subscriberId }] : [];
      }
    },
  })
});

const ProfilesType = new GraphQLObjectType({
  name: 'profiles',
  fields: () => ({
    id: {
      type: UUIDType
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
        
        return res.at(0)?.id ? res.at(0) : null;
      }
    }
  })
});

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString }
  }
});

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }
});

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLFloat },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLString }
  }
});

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
  }
});

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
  }
});

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
  }
});

const Mutation = new GraphQLObjectType({
  name: 'mutation',
  fields: {
    createPost: {
      type: PostType,
      args: { dto: {type: CreatePostInput} },
      async resolve(parent, args) {
        console.log('HERE ARGS ', args.dto);
        const res = await prisma.post.create({
          data: args.dto,
        });
        return res;
      }
    },
    createUser: {
      type: UsersType,
      args: { dto: {type: CreateUserInput} },
      async resolve(parent, args) {
        const res = await prisma.user.create({
          data: args.dto,
        });
        return res;
      }
    },
    createProfile: {
      type: ProfilesType,
      args: { dto: {type: CreateProfileInput} },
      async resolve(parent, args) {
        const yearOfBirth = `${args.dto.yearOfBirth as number}`;
        const testDate = Number(new Date(yearOfBirth));
        
        if (!isNaN(testDate)) {
          const res = await prisma.profile.create({
            data: args.dto,
          })
          return res;
        } else {
          const error = new Error(`Int cannot represent non-integer value: ${ yearOfBirth }`)
          throw error;
        }
      }
    },
    deletePost: {
      type: UUIDType,
      args: { id: {type: UUIDType} },
      async resolve(parent, args) {
        
        try {
          await prisma.post.delete({
            where: {
              id: args.id,
            },
          });
          return null;
        } catch (error) {
          return error;
        }
      }
    },
    deleteProfile: {
      type: UUIDType,
      args: { id: {type: UUIDType} },
      async resolve(parent, args) {
        try {
          await prisma.profile.delete({
            where: {
              id: args.id,
            },
          });
          return null;
        } catch (error) {
          return error;
        }
      }
    },
    deleteUser: {
      type: UUIDType,
      args: { id: {type: UUIDType} },
      async resolve(parent, args) {
        try {
          await prisma.user.delete({
            where: {
              id: args.id
            }
          });
          return null;
        } catch (error) {
          return error;
        }
      }
    },
    changePost: {
      type: PostType,
      args: { id: {type: UUIDType}, dto: { type: ChangePostInput}},
      async resolve(parent, args) {
        const res = prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
        return res;
      }
    },
    changeProfile: {
      type: ProfilesType,
      args: { id: {type: UUIDType}, dto: { type: ChangeProfileInput} },
      async resolve(parent, args) {
        const existProfile = await prisma.profile.findUnique({
          where: {
            id: args.id,
          }
        });
        if (existProfile) {
          const res = prisma.profile.update({
            where: { id: args.id },
            data: args.dto,
          });
          return res;
        } else {
          const error = new Error(`Field ${args.id as string} is not defined by type ChangeProfileInput`)
          throw error;
        }
      }
    },
    changeUser: {
      type: UsersType,
      args: { id: {type: UUIDType}, dto: { type: ChangeUserInput} },
      async resolve(parent, args) {
        const res = prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
        return res;
      }
    },
  }
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      args: {},
      async resolve() {
        const res = await prisma.memberType.findMany(); // return all members
        
        return res.at(0)?.id ? res : null;
      }
    },
    memberType: {
      type: MemberType,
      args: {
        id: {
          type: MemberTypeId
        }
      },
      async resolve(parent, args) {
        const res = await prisma.memberType.findUnique({ // return member by id
          where: {
            id: args.id,
          }
        });
        
        return res?.id ? res : null;
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      args: {},
      async resolve() {
        const res = await prisma.post.findMany();
        
        return res.at(0)?.id ? res : null;
      }
    },
    post: {
      type: PostType,
      args: {
        id: {
          type: UUIDType
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
        
        return res?.id ? res : null;
      }
    },
    users: {
      type: new GraphQLList(UsersType),
      args: {},
      async resolve() {
        const res = await prisma.user.findMany();
        
        return res.at(0)?.id ? res : null;
      }
    },
    user: {
      type: UsersType,
      args: {
        id: {
          type: UUIDType
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
        
        return res?.id ? res : null;
      }
    },
    profiles: {
      type: new GraphQLList(ProfilesType),
      args: {},
      async resolve() {
        const res = await prisma.profile.findMany();
        
        return res.at(0)?.id ? res : null;
      }
    },
    profile: {
      type: ProfilesType,
      args: {
        id: {
          type: UUIDType
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
        
        return res?.id ? res : null;
      }
    },
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
  types: [UUIDType, MemberTypeId, CreatePostInput, CreateProfileInput, CreateUserInput]
});