import { Client, Account, ID, Databases, Query ,Storage} from 'appwrite';
import { appwriteConfig } from './config';
import { constructFileUrl, getFileType, parseStringify } from 'lib/utils';

const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl!)
  .setProject(appwriteConfig.projectId!);

const account = new Account(client);
const databases = new Databases(client);
const storage=new Storage(client)

interface getFilesProps{
    userId:string | undefined,
    email:string | undefined,
    type1?:string | undefined,
    type2?:string | undefined,
    searchText:string,
    sortText:string | undefined,
    limit?:number
}

const createQueries=(userId:string,email:string,types:string[],searchText:string,sortText:string,limit?:number)=>{
    const queries = [
    Query.or([
      Query.equal("accountId", [userId]),
      Query.contains("users", [email]),
    ]),
  ];
    if(types.length > 0) queries.push(Query.equal("type", types))

    if(searchText!=" ") queries.push(Query.contains("name", searchText))

    if(limit) queries.push(Query.limit(limit))

    if(sortText.includes("-"))
    {
      const [sortBy,orderBy]=sortText.split("-");
      queries.push(orderBy=="asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy))
    }

  return queries
}

export const getFiles=async({
    userId ,
    email,
    type1,
    type2,
    searchText,
    sortText="$createdAt-desc",
    limit
}:getFilesProps)=>{
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

        return parseStringify(files)

        
    } catch (error) {
        console.log(error)
        throw new Error('Failed to fetch file')
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


/*export const uploadFile=async({
    file,
    accountId,
}:{file:any,accountId:string})=>{
   
    try {
      
        //For the file storage
        const bucketFile=await storage.createFile(
          appwriteConfig.bucketId!,
          ID.unique(),
          file // file should be a File or Blob object
        )
        

        //For the metadata store using database
        const fileDocument={
            type:getFileType(bucketFile.name).type,
            name:bucketFile.name,
            url:constructFileUrl(bucketFile.$id),
            extension:getFileType(bucketFile.name).extension,
            size:bucketFile.sizeOriginal,
            accountId,
            users:[],
            bucketFileId:bucketFile.$id
        }
       

        //If metadata is not stored then delete file as well
        const newFile=await databases.createDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.files!,
            ID.unique(),
            fileDocument,
        ).catch(async (error:any)=>{
            await storage.deleteFile(
                appwriteConfig.bucketId!,
                bucketFile.$id
            );
            throw new Error(error.message as string)
        })

        //Returning the metadata
        return parseStringify(newFile)


    } catch (error:any) {
        console.log(error)
        throw new Error(error.message)
    }}  
*/

export const uploadToAppwrite = async (file: {
  uri: string;
  name: string;
  mimeType?: string;
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

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return parseStringify(data);
  } 
  catch (error:any) {
    console.log(error)
    throw new Error(error.message)
  }
 
};
