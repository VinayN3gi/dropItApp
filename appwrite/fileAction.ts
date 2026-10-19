import { ID, Query } from 'appwrite';
import { appwriteConfig } from './config';
import { constructFileUrl, getFileType, parseStringify } from 'lib/utils';
import { client, account, databases, storage } from './client';

type AppwriteFile = {
  $createdAt: string;
  $id: string;
  $permissions: string[];
  $updatedAt: string;
  bucketId: string;
  chunksTotal: number;
  chunksUploaded: number;
  mimeType: string;
  name: string;
  signature: string;
  sizeOriginal: number;
};


interface getFilesProps {
    userId: string | undefined;
    email: string | undefined;
    type1?: string | undefined;
    type2?: string | undefined;
    searchText?: string;
    sortText?: string | undefined;
    limit?: number;
}

const createQueries = (
    userId: string,
    email: string,
    types: string[],
    searchText: string = "",
    sortText: string = "$createdAt-desc",
    limit?: number
) => {
    const queries = [
        Query.or([
            Query.equal("accountId", [userId]),
            Query.contains("users", [email]),
        ]),
    ];
    if (types.length > 0) queries.push(Query.equal("type", types));

    if (searchText && searchText.trim() !== "") {
        queries.push(Query.contains("name", searchText.trim()));
    }

    if (limit) queries.push(Query.limit(limit));

    if (sortText && sortText.includes("-")) {
        const [sortBy, orderBy] = sortText.split("-");
        queries.push(orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy));
    }

    return queries;
};

export const getFiles = async ({
    userId,
    email,
    type1,
    type2,
    searchText = "",
    sortText = "$createdAt-desc",
    limit,
}: getFilesProps) => {
    console.log(`The search and sort text are ${searchText} and ${sortText}`)
    try {
        if(!userId) throw new Error("User not found")
        if(!email) throw new Error("Email not found")
        const types=[];
        if(type1) types.push(type1);
        if(type2) types.push(type2)

        const queries=createQueries(userId, email, types, searchText, sortText, limit)
        const files=await databases.listDocuments(
            appwriteConfig.databaseId!,
            appwriteConfig.files!,
            queries
        )

        return parseStringify(files);
    } catch (error: any) {
        console.log('getFiles primary query error:', error?.message);
        try {
            const types: string[] = [];
            if (type1) types.push(type1);
            if (type2) types.push(type2);

            const fallbackQueries = createQueries(userId || '', email || '', [], searchText, sortText, limit);
            const fallbackFiles = await databases.listDocuments(
                appwriteConfig.databaseId!,
                appwriteConfig.files!,
                fallbackQueries
            );
            if (types.length > 0) {
                fallbackFiles.documents = fallbackFiles.documents.filter((doc: any) =>
                    types.includes(doc.type)
                );
                fallbackFiles.total = fallbackFiles.documents.length;
            }
            return parseStringify(fallbackFiles);
        } catch (fallbackError) {
            console.log('getFiles fallback error:', fallbackError);
            throw new Error('Failed to fetch file');
        }
    }
}


declare type FileType = "document" | "image" | "video" | "audio" | "other";

export async function getTotalSpaceUsed({userId,email}:{userId:string,email:string}) {
  try {
    
    const files = await databases.listDocuments(
      appwriteConfig.databaseId!,
      appwriteConfig.files!,
      [Query.equal("accountId", [userId])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    console.log(error)
    throw new Error('Unable to fetch')
  }
}


import { Platform } from 'react-native';

// Directly hitting the endpoint because storage.createFile has Hermes FormData issues in React Native
export const uploadToAppwrite = async (file: {
  uri: string;
  name: string;
  mimeType?: string;
  accountId: string;
}) => {
  try {
    let fileName = file.name || 'uploaded_file';
    // Ensure images have a proper extension so Appwrite and getFileType recognize them
    if (file.mimeType?.startsWith('image/') && !fileName.includes('.')) {
      const ext = file.mimeType.split('/')[1] || 'jpg';
      fileName = `${fileName}.${ext === 'jpeg' ? 'jpg' : ext}`;
    }

    const formData = new FormData();
    formData.append('fileId', 'unique()');
    formData.append('file', {
      uri: file.uri,
      name: fileName,
      type: file.mimeType || 'application/octet-stream',
    } as any);

    // Use XHR instead of fetch — React Native's fetch breaks multipart
    // boundaries when Content-Type is set manually, causing the
    // "Unsupported FormDataPart implementation" error with Hermes/new arch.
    // The native networking layer automatically includes the active session cookie.
    const data: AppwriteFile = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        `${appwriteConfig.endpointUrl}/storage/buckets/${appwriteConfig.bucketId}/files`
      );
      xhr.setRequestHeader('X-Appwrite-Project', appwriteConfig.projectId ?? '');
      xhr.timeout = 60000; // 60 s — prevents spinner from hanging forever on stalled requests
      xhr.onload = () => {
        let parsed: any;
        try {
          parsed = JSON.parse(xhr.responseText);
        } catch {
          parsed = { message: xhr.responseText };
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(parsed);
        } else {
          reject(new Error(parsed?.message || JSON.stringify(parsed)));
        }
      };
      xhr.onerror = () => reject(new Error('Network request failed'));
      xhr.ontimeout = () => reject(new Error('Upload timed out. Please check your connection and try again.'));
      xhr.send(formData);
    });

    // Detect type and extension, defaulting to image if mimeType indicates an image
    let detectedType = getFileType(data.name).type;
    let detectedExtension = getFileType(data.name).extension;
    if (file.mimeType?.startsWith('image/') || data.mimeType?.startsWith('image/')) {
      detectedType = 'image';
      if (!detectedExtension) detectedExtension = 'jpg';
    }

    const fileDocument: any = {
      type: detectedType,
      name: data.name,
      url: constructFileUrl(data.$id),
      extension: detectedExtension,
      size: data.sizeOriginal || 0,
      users: [],
      bucketFileId: data.$id,
      accountId: file.accountId,
    };

    if (file.accountId) {
      fileDocument.owners = file.accountId;
    }

    let newFile;
    try {
      newFile = await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.files!,
        ID.unique(),
        fileDocument,
      );
    } catch (docError: any) {
      console.warn('Initial createDocument failed, retrying without owners relationship:', docError?.message);
      // In Appwrite, owners is an optional relationship. If accountId does not match a user docId,
      // retry without owners so the upload succeeds cleanly.
      delete fileDocument.owners;
      newFile = await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.files!,
        ID.unique(),
        fileDocument,
      ).catch(async (retryErr: any) => {
        await storage.deleteFile(appwriteConfig.bucketId!, data.$id).catch(() => {});
        console.error('Final createDocument error:', retryErr);
        throw new Error(retryErr?.message || 'Failed to create file document in database');
      });
    }

    return parseStringify(newFile);
  } catch (error: any) {
    console.error('uploadToAppwrite error:', error);
    throw new Error(error?.message || 'Failed to upload file');
  }
};

export const deleteFile = async ({ fileId, bucketFileId }: { fileId: string; bucketFileId: string }) => {
  try {
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.files!,
      fileId,
    );

    if (bucketFileId) {
      await storage.deleteFile(appwriteConfig.bucketId!, bucketFileId).catch((storageErr) => {
        console.warn('Storage file deletion note:', storageErr?.message);
      });
    }

    return parseStringify(deletedFile);
  } catch (error: any) {
    console.error('deleteFile error:', error);
    throw new Error(error.message || 'Failed to delete file');
  }
};

export interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
}

export const updateFileUsers = async ({ fileId, emails }: UpdateFileUsersProps) => {
  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.files!,
      fileId,
      {
        users: emails,
      }
    );

    return parseStringify(updated);
  } catch (error: any) {
    console.error('updateFileUsers error:', error);
    throw new Error(error?.message || 'Unable to share file');
  }
};

export { logOut } from './userAction';