import { Client, Account, ID, Databases } from 'appwrite';
import { appwriteConfig } from './config';

const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl!)
  .setProject(appwriteConfig.projectId!);

const account = new Account(client);
const databases = new Databases(client);

export async function logIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return {
      success: true,
      session,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Login failed',
    };
  }
}

export async function createUser(email: string, password: string, name: string) {
  try {
    const newUser = await account.create(ID.unique(), email, password, name);
    const createDoc = await databases.createDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.users!,
      ID.unique(),
      {
        fullName: name,
        email,
        accountId: ID.unique(),
      }
    );

    if (!createDoc) {
      throw new Error('Failed to create user document');
    }

    return {
      success: true,
      user: newUser,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to create user',
    };
  }
}

export async function getUser() {
  try {
    const user = await account.get();
    return {
      success: true,
      user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to fetch user',
    };
  }
}


