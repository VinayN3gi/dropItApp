export const appwriteConfig={
    endpointUrl:process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId:process.env.EXPO_PUBLIC_APPWRITE_PROJECT,
    databaseId:process.env.EXPO_PUBLIC_APPWRITE_DATABASE,
    users:process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION,
    files:process.env.EXPO_PUBLIC_APPWRITE_FILES_COLLECTION,
    bucketId:process.env.EXPO_PUBLIC_APPWRITE_BUCKET,
    secretKey:process.env.EXPO_APPWRITE_KEY,
    jwt:process.env.EXPO_APPWRITE_JWT
}