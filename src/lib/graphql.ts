import { GraphQLClient } from 'graphql-request';
import { nhost } from './nhost';

// Create GraphQL client with dynamic headers
export const createGraphQLClient = () => {
  const client = new GraphQLClient(`${nhost.graphql.getUrl()}`, {
    headers: {
      'Authorization': `Bearer ${nhost.auth.getAccessToken()}`,
    },
  });
  return client;
};

// GraphQL mutations and queries
export const INSERT_CHAT_MUTATION = `
  mutation InsertChats($title: String, $user_id: uuid) {
    insert_chats(objects: {title: $title, user_id: $user_id}) {
      affected_rows
      returning {
        id
        title
        user_id
        created_at
        updated_at
      }
    }
  }
`;

export const GET_USER_CHATS_QUERY = `
  query GetUserChats($user_id: uuid!) {
    chats(where: {user_id: {_eq: $user_id}}, order_by: {updated_at: desc}) {
      id
      title
      user_id
      created_at
      updated_at
    }
  }
`;

// Chat creation function
export const createChat = async (title: string, userId: string) => {
  const client = createGraphQLClient();
  
  try {
    const data = await client.request(INSERT_CHAT_MUTATION, {
      title,
      user_id: userId,
    });
    
    return data.insert_chats.returning[0];
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Get user chats function
export const getUserChats = async (userId: string) => {
  const client = createGraphQLClient();
  
  try {
    const data = await client.request(GET_USER_CHATS_QUERY, {
      user_id: userId,
    });
    
    return data.chats;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};