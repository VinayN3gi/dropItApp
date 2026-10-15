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


//Directly hitting the endpoint because create storage does not work for 
export const uploadToAppwrite = async (file: {
  uri: string;
  name: string;
  mimeType?: string;
  accountId:string
}) => {
  try {
     const formData = new FormData();
    formData.append("fileId", "unique()");

  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/octet-stream',
  } as any);

  const response = await fetch(
    `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.bucketId}/files`,
    {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': appwriteConfig.projectId ?? '',
        'X-Appwrite-Key': appwriteConfig.secretKey ?? '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }
  );

  const data :AppwriteFile= await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));

  // Use accountId from the file parameter, not from the response data
  const fileDocument = {
    type: getFileType(data.name).type,
    name: data.name,
    url: constructFileUrl(data.$id),
    extension: getFileType(data.name).extension,
    size: data.sizeOriginal,
    owners: file.accountId,
    users:[],
    bucketFileId:data.$id,
    accountId:file.accountId
  }
   const newFile=await databases.createDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.files!,
            ID.unique(),
            fileDocument,
        ).catch(async (error:unknown)=>{
            await storage.deleteFile(
                appwriteConfig.bucketId!,
                data.$id
            );
            console.log(error)
            throw new Error("Failed to create file document")
        })

  return parseStringify(newFile);
  } 
  catch (error:any) {
    console.log(error)
    throw new Error(error.message)
  }
};

export const deleteFile=async({fileId,bucketFileId}:{fileId:string,bucketFileId:string})=>{
  try {
    const deletedFile=await databases.deleteDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.files!,
      fileId,
    )
    if(deletedFile)
    {
      await storage.deleteFile(appwriteConfig.bucketId!,bucketFileId)
    }

    return parseStringify(deletedFile)
  } catch (error:any) {
      throw new Error(error.message)
  }
}


export { logOut } from './userAction';