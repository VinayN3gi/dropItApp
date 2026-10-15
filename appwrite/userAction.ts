import { ID } from 'appwrite';
import { appwriteConfig } from './config';
import { account, databases } from './client';

export async function logIn(email: string, password: string) {
  try {
    // 1. Proactively clear any lingering session on this client to avoid "session is active" error
    try {
      await account.deleteSession('current');
    } catch {
      // Ignore: no active session to delete
    }

    const session = await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return {
      success: true,
      session,
      user,
    };
  } catch (error: any) {
    const errorMsg = error?.message || '';
    // If still getting "session is active", delete all sessions and retry once
    if (errorMsg.toLowerCase().includes('session is active') || error?.type === 'user_already_active') {
      try {
        await account.deleteSessions();
        const session = await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        return {
          success: true,
          session,
          user,
        };
      } catch (retryError: any) {
        // Fallback: if there's already an active user session, return that user
        try {
          const user = await account.get();
          return {
            success: true,
            user,
          };
        } catch {
          return {
            success: false,
            error: retryError?.message || errorMsg || 'Login failed',
          };
        }
      }
    }

    return {
      success: false,
      error: errorMsg || 'Login failed',
    };
  }
}

export async function createUser(email: string, password: string, name: string) {
  try {
    // Clear any lingering session first
    try {
      await account.deleteSession('current');
    } catch {
      // Ignore
    }

    const newUser = await account.create(ID.unique(), email, password, name);
    const createDoc = await databases.createDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.users!,
      ID.unique(),
      {
        fullName: name,
        email,
        accountId: newUser.$id,
      }
    );

    if (!createDoc) {
      throw new Error('Failed to create user document');
    }

    // Automatically establish a session upon successful registration
    const session = await account.createEmailPasswordSession(email, password);

    return {
      success: true,
      user: newUser,
      session,
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

export async function logOut() {
  try {
    await account.deleteSession('current');
    return {
      success: true,
    };
  } catch {
    // If session was already invalidated or expired, consider logout successful
    return {
      success: true,
    };
  }
}


