import { Client, Databases, Storage, Avatars, Account } from "appwrite";

/**
 * Configuration object for Appwrite services.
 * Contains essential IDs and URLs for project setup:
 * - projectId: Unique identifier for the Appwrite project
 * - url: Base URL for the Appwrite API
 * - databaseId: ID of the database used in the project
 * - storageId: ID of the storage bucket for file uploads
 * - userCollectionId: ID of the collection storing user data
 * - postCollectionId: ID of the collection storing post data
 * - saveCollectionId: ID of the collection storing saved posts
 */

export const appwriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  url: import.meta.env.VITE_APPWRITE_URL,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  saveCollectionId: import.meta.env.VITE_APPWRITE_SAVE_COLLECTION_ID,
};

/**
 * Initialization and configuration of Appwrite services:
 * 
 * 1. Create a new Client instance:
 *    - This is the main entry point for interacting with Appwrite services.
 * 
 * 2. Set the API endpoint:
 *    - Configure the client to use the correct Appwrite server URL.
 * 
 * 3. Set the project ID:
 *    - Associate the client with the specific Appwrite project.
 * 
 * 4. Initialize service-specific instances:
 *    - Databases: For interacting with Appwrite databases and collections.
 *    - Storage: For managing file uploads and retrievals.
 *    - Account: For handling user authentication and account management.
 *    - Avatars: For generating and managing user avatars.
 * 
 * These instances will be used throughout the application to interact
 * with various Appwrite services in a type-safe and efficient manner.
 */

export const client = new Client();

client.setEndpoint(appwriteConfig.url);

client.setProject(appwriteConfig.projectId);

export const databases = new Databases(client);

export const storage = new Storage(client);

export const account = new Account(client);

export const avatars = new Avatars(client);
