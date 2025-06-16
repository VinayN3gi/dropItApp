# DropIt Mobile Application

A modern and responsive cloud storage mobile app built using React Native (Expo) and Tailwind CSS. It uses Appwrite for authentication, database, and file storage, providing a seamless Google Drive-like experience on mobile devices.
Link to the companion website https://github.com/VinayN3gi/storeit


## <a name="table">Table of Contents</a>

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Installation](#installation)
5. [Usage](#usage)

## Introduction
DropIt Mobile enables users to securely upload and preview files from their mobile device. With real-time access to cloud storage via Appwrite, users can view folders, manage uploads, and preview content directly from their phone. Built with performance, simplicity, and cross-platform support in mind.
.

## <a name="tech-stack">Tech Stack</a>

- React Native (Expo) : Framework for building native apps using React
- Tailwind CSS (Nativewind) : Utility-first styling for React Native
- Appwrite : Backend services including Auth, Database, and Storage
- TypeScript : Strongly typed JavaScript for improved maintainability





## <a name="features">Features</a>

- Secure user authentication using Appwrite
- Folder structure and navigation
- File uploads from device (images, documents, etc.)
- File previews for supported formats (images, PDFs)
- Persistent login sessions
- Syncs with your Appwrite instance in real time

## <a name="installation">Installation</a>

To run the project locally, follow these steps:

### Prerequisites

- Node.js
- Git
- pnpm or npm

### Installation

1. Clone the repository:

   ```bash
   https://github.com/VinayN3gi/dropItApp.git
   cd dropItApp
2. Install depenpendencies:
    ```bash
    npm install
3. Create a .env file at the root of the project and add the following
   ```env
    EXPO_PUBLIC_APPWRITE_PROJECT=your_project_id
    EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
    EXPO_PUBLIC_APPWRITE_DATABASE=your_database_id
    EXPO_PUBLIC_APPWRITE_USERS_COLLECTION=your_user_database_id
    EXPO_PUBLIC_APPWRITE_FILES_COLLECTION=your_files_database_id
    EXPO_PUBLIC_APPWRITE_BUCKET=your_bucket_Id
    EXPO_APPWRITE_KEY=your_secret_api_key
5. Start the development server
    ```bash
    npx expo start
    
## <a name="usage">Usage</a>
- Sign up or log in using Appwrite Auth
- Upload files using file picker or camera
- Browse folders and view files
- Preview supported file types (images, PDFs, etc.)
- Enjoy automatic sync across sessions

