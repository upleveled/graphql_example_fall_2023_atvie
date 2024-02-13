import { gql } from '@apollo/client';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLError } from 'graphql';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  createAnimal,
  deleteAnimal,
  getAnimalInsecure,
  getAnimalsInsecure,
  updateAnimal,
} from '../../../database/animals';
import {
  Animal,
  CreateAnimalMutationVariables,
  DeleteAnimalMutationVariables,
  LoginMutationVariables,
  QueryAnimalArgs,
  UpdateAnimalMutationVariables,
} from '../../graphqlGeneratedTypes';

export type GraphqlResponseBody =
  | {
      animal: Animal;
    }
  | Error;

type GraphqlContext = {
  // FIXME: Rename insecureSessionTokenCookie type to sessionToken everywhere
  insecureSessionTokenCookie: RequestCookie | undefined;
};

const typeDefs = gql`
  type Animal {
    id: ID!
    firstName: String!
    type: String!
    accessory: String
  }

  type User {
    id: ID!
    username: String
  }

  type Query {
    animals: [Animal]
    animal(id: ID!): Animal
  }

  type Mutation {
    createAnimal(firstName: String!, type: String!, accessory: String): Animal

    deleteAnimal(id: ID!): Animal

    updateAnimal(
      id: ID!
      firstName: String!
      type: String!
      accessory: String
    ): Animal

    login(username: String!, password: String!): User
  }
`;

const resolvers = {
  Query: {
    animals: async () => {
      return await getAnimalsInsecure();
    },

    animal: async (parent: null, args: QueryAnimalArgs) => {
      return await getAnimalInsecure(Number(args.id));
    },
  },

  Mutation: {
    createAnimal: async (
      parent: null,
      args: CreateAnimalMutationVariables,
      context: GraphqlContext,
    ) => {
      if (
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.type !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new GraphQLError('Required field is missing');
      }

      if (!context.insecureSessionTokenCookie) {
        throw new GraphQLError('Unauthorized operation');
      }

      return await createAnimal(context.insecureSessionTokenCookie.value, {
        firstName: args.firstName,
        type: args.type,
        accessory: args.accessory || null,
      });
    },

    deleteAnimal: async (
      parent: null,
      args: DeleteAnimalMutationVariables,
      context: GraphqlContext,
    ) => {
      if (!context.insecureSessionTokenCookie) {
        throw new GraphQLError('Unauthorized operation');
      }
      return await deleteAnimal(
        context.insecureSessionTokenCookie.value,
        Number(args.id),
      );
    },

    updateAnimal: async (
      parent: null,
      args: UpdateAnimalMutationVariables,
      context: GraphqlContext,
    ) => {
      if (!context.insecureSessionTokenCookie) {
        throw new GraphQLError('Unauthorized operation');
      }

      if (
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.type !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new GraphQLError('Required field missing');
      }
      return await updateAnimal(context.insecureSessionTokenCookie.value, {
        id: Number(args.id),
        firstName: args.firstName,
        type: args.type,
        accessory: args.accessory || null,
      });
    },

    login: (parent: null, args: LoginMutationVariables) => {
      if (
        typeof args.username !== 'string' ||
        typeof args.password !== 'string' ||
        !args.username ||
        !args.password
      ) {
        throw new GraphQLError('Required field missing');
      }
      // FIXME: Implement secure authentication
      if (args.username !== 'victor' || args.password !== 'asdf') {
        throw new GraphQLError('Invalid username or password');
      }

      // FIXME: Create a secure session token cookie:
      // 1. Generate a token
      // 2. Store the token in the database
      // 3. Set a cookie with the token value
      cookies().set(
        'sessionToken',
        'ae96c51f--fixme--insecure-hardcoded-session-token--5a3e491b4f',
        {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        },
      );
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
});

const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer, {
  context: async (req) => {
    return {
      // FIXME: Create secure session token and rename insecureSessionTokenCookie to sessionToken everywhere
      insecureSessionTokenCookie: await req.cookies.get('sessionToken'),
    };
  },
});

// This setup is incomplete without type annotation
// export async function GET(req: NextRequest) {
//   return await handler(req);
// }

// export async function POST(req: NextRequest) {
//   return await handler(req);
// }

export async function GET(
  req: NextRequest,
): Promise<NextResponse<GraphqlResponseBody>> {
  return (await handler(req)) as NextResponse<GraphqlResponseBody>;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<GraphqlResponseBody>> {
  return (await handler(req)) as NextResponse<GraphqlResponseBody>;
}
