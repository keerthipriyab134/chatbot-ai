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

// Messages queries and mutations
export const INSERT_MESSAGE_MUTATION = `
  mutation InsertMessage($chat_id: uuid!, $content: String!, $is_bot: Boolean!, $user_id: uuid!) {
    insert_messages(objects: {chat_id: $chat_id, content: $content, is_bot: $is_bot, user_id: $user_id}) {
      affected_rows
      returning {
        id
        content
        is_bot
        created_at
        chat_id
        user_id
      }
    }
  }
`;

export const GET_CHAT_MESSAGES_QUERY = `
  query GetChatMessages($chat_id: uuid!) {
    messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
      id
      content
      is_bot
      created_at
      chat_id
      user_id
    }
  }
`;

export const UPDATE_CHAT_TITLE_MUTATION = `
  mutation UpdateChatTitle($chat_id: uuid!, $title: String!) {
    update_chats(where: {id: {_eq: $chat_id}}, _set: {title: $title, updated_at: "now()"}) {
      affected_rows
      returning {
        id
        title
        updated_at
      }
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

// Save message function
export const saveMessage = async (chatId: string, content: string, isBot: boolean, userId: string) => {
  const client = createGraphQLClient();
  
  try {
    const data = await client.request(INSERT_MESSAGE_MUTATION, {
      chat_id: chatId,
      content,
      is_bot: isBot,
      user_id: userId,
    });
    
    return data.insert_messages.returning[0];
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Get chat messages function
export const getChatMessages = async (chatId: string) => {
  const client = createGraphQLClient();
  
  try {
    const data = await client.request(GET_CHAT_MESSAGES_QUERY, {
      chat_id: chatId,
    });
    
    return data.messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Update chat title function
export const updateChatTitle = async (chatId: string, title: string) => {
  const client = createGraphQLClient();
  
  try {
    const data = await client.request(UPDATE_CHAT_TITLE_MUTATION, {
      chat_id: chatId,
      title,
    });
    
    return data.update_chats.returning[0];
  } catch (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }
};