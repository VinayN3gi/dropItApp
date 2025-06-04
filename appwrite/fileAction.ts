import { Client, Account, ID, Databases, Query } from 'appwrite';
import { appwriteConfig } from './config';
import { parseStringify } from 'lib/utils';

const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl!)
  .setProject(appwriteConfig.projectId!);

const account = new Account(client);
const databases = new Databases(client);

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
