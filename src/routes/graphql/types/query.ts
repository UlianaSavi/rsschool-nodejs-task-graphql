/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLList, GraphQLObjectType, GraphQLString, GraphQLInputObjectType, GraphQLBoolean, GraphQLFloat } from 'graphql';
import { UUIDType } from './uuid.js';
import { prisma } from '../schemas.js';

export const MemberType = new GraphQLObjectType({
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

export const PostType = new GraphQLObjectType({
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

export const SubscribedToUserType = new GraphQLObjectType({
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

                return res.at(0) ?.authorId ? [{
                    id: res.at(0) ?.authorId
                }] : [];
            }
        }
    })
});

export const UserSubscribedToType = new GraphQLObjectType({
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

                return res.at(0) ?.subscriberId ? [{
                    id: res.at(0) ?.subscriberId
                }] : [];
            }
        }
    })
});

export const UsersType = new GraphQLObjectType({
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

                return res ?.id ? res : null;
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

                return res.at(0) ?.id ? res : null;
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

                return res.at(0) ?.authorId ? [{
                    id: res.at(0) ?.authorId
                }] : [];
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

                return res.at(0) ?.subscriberId ? [{
                    id: res.at(0) ?.subscriberId
                }] : [];
            }
        },
    })
});

export const ProfilesType = new GraphQLObjectType({
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

                return res.at(0) ?.id ? res.at(0) : null;
            }
        }
    })
});

export const CreatePostInput = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: {
        title: {
            type: GraphQLString
        },
        content: {
            type: GraphQLString
        },
        authorId: {
            type: GraphQLString
        }
    }
});

export const CreateUserInput = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: {
        name: {
            type: GraphQLString
        },
        balance: {
            type: GraphQLFloat
        },
    }
});

export const CreateProfileInput = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: {
        isMale: {
            type: GraphQLBoolean
        },
        yearOfBirth: {
            type: GraphQLFloat
        },
        memberTypeId: {
            type: GraphQLString
        },
        userId: {
            type: GraphQLString
        }
    }
});