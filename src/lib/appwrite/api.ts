import { ID, ImageGravity, Query } from "appwrite";
import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

/**
 * Creates a new user account and saves the user information to the database.
 * 
 * @param user - An object containing the new user's information (email, password, name, username)
 * @returns The newly created user object, or an error if the creation fails
 */

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );
    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * Saves a new user's information to the database.
 * 
 * @param user - An object containing the user's information:
 *   - accountId: The unique identifier for the user's account
 *   - email: The user's email address
 *   - name: The user's full name
 *   - imageUrl: The URL of the user's avatar image
 *   - username: (Optional) The user's chosen username
 * @returns The newly created user document, or undefined if an error occurs
 */

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Signs in a user with their email and password.
 * 
 * @param user - An object containing the user's credentials:
 *   - email: The user's email address
 *   - password: The user's password
 * @returns The created session object if successful, or undefined if an error occurs
 */

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    return session;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves the current user's account information.
 * 
 * This function uses the Appwrite SDK's account.get() method to fetch
 * the details of the currently authenticated user's account.
 * 
 * @returns The current account object if successful, or undefined if an error occurs
 */

export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves the current user's detailed information from the database.
 * 
 * This function performs the following steps:
 * 1. Calls getAccount() to fetch the current account information.
 * 2. If successful, it queries the database to find the user document
 *    associated with the account's ID.
 * 3. Returns the first matching user document.
 * 
 * @returns The current user's document from the database if found,
 *          or undefined if an error occurs or no user is found.
 */

export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves a list of users from the database.
 * 
 * This function queries the user collection in the Appwrite database,
 * with the following features:
 * - Users are ordered by creation date in descending order (newest first).
 * - An optional limit parameter can be provided to restrict the number of results.
 * 
 * @param limit Optional. The maximum number of users to retrieve.
 * @returns A Promise that resolves to the list of users if successful,
 *          or undefined if an error occurs.
 */

export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries,
    );
    return users;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Signs out the current user from their account.
 * 
 * This function attempts to delete the current session using the Appwrite account API.
 * It's typically used when a user wants to log out of the application.
 * 
 * @returns A Promise that resolves to the deleted session object if successful,
 *          or undefined if an error occurs during the sign-out process.
 */

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Creates a new post in the Appwrite database.
 * 
 * This function performs the following steps:
 * 1. Uploads the provided file to Appwrite storage.
 * 2. Generates a preview URL for the uploaded file.
 * 3. Processes the tags, converting them into an array.
 * 4. Creates a new document in the posts collection with the post data.
 * 
 * If any step fails, it attempts to clean up by deleting the uploaded file.
 * 
 * @param post An INewPost object containing the post details (userId, file, caption, location, tags).
 * @returns A Promise that resolves to the newly created post document if successful,
 *          or undefined if an error occurs during the process.
 */

export async function createPost(post: INewPost) {
  try {
    // upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error;

    // get file url
    const fileUrl = getFilePreview(uploadedFile.$id);

    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // convert tags in an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // save post to database
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile?.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Uploads a file to Appwrite storage.
 * 
 * This function takes a File object and uploads it to the Appwrite storage bucket
 * specified in the appwriteConfig. It generates a unique ID for the file using
 * Appwrite's ID.unique() method.
 * 
 * @param file The File object to be uploaded.
 * @returns A Promise that resolves to the uploaded file object if successful,
 *          or undefined if an error occurs during the upload process.
 */

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves a preview of a file from Appwrite storage.
 * 
 * This function generates a URL for a preview of the specified file. It uses the
 * Appwrite storage service to create a preview with the following parameters:
 * - File ID: Unique identifier for the file in storage
 * - Width: 2000 pixels
 * - Height: 2000 pixels
 * - Gravity: Top (crops from the top if resizing is necessary)
 * - Quality: 100 (highest quality)
 * 
 * @param fileId The ID of the file to preview
 * @returns A URL string for the file preview, or undefined if an error occurs
 */

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Deletes a file from Appwrite storage.
 * 
 * This function attempts to delete a file from the Appwrite storage service using the provided file ID.
 * It uses the storage.deleteFile method from the Appwrite SDK.
 * 
 * @param fileId The unique identifier of the file to be deleted
 * @returns A Promise that resolves to an object with status "ok" if the deletion is successful,
 *          or undefined if an error occurs during the deletion process.
 */

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves the most recent posts from the database.
 * 
 * This function fetches the 20 most recently created posts from the Appwrite database.
 * It uses the databases.listDocuments method with the following parameters:
 * - Database ID: Specified in appwriteConfig
 * - Collection ID: Post collection ID from appwriteConfig
 * - Queries:
 *   - Order descending by creation date
 *   - Limit to 20 posts
 * 
 * @returns A Promise that resolves to the list of recent posts,
 *          or throws an Error if the posts couldn't be retrieved.
 */

export async function getRecentPosts() {
  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [Query.orderDesc("$createdAt"), Query.limit(20)]
  );
  if (!posts) {
    throw Error;
  }
  return posts;
}

/**
 * Likes or unlikes a post by updating its likes array.
 * 
 * This function updates the 'likes' field of a post document in the Appwrite database.
 * It takes the post ID and the updated likes array as parameters.
 * 
 * @param postId The unique identifier of the post to be updated
 * @param likesArray An array of user IDs who have liked the post
 * @returns A Promise that resolves to the updated post document if successful,
 *          or undefined if an error occurs during the update process.
 */

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Saves a post for a user by creating a new document in the 'save' collection.
 * 
 * This function creates a new document in the Appwrite database to represent
 * a saved post. It associates the given post ID with the user ID.
 * 
 * @param postId The unique identifier of the post to be saved
 * @param userId The unique identifier of the user saving the post
 * @returns A Promise that resolves to the newly created 'save' document if successful,
 *          or undefined if an error occurs during the save process.
 */

export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.saveCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Deletes a saved post record from the database.
 * 
 * This function removes a specific saved post record from the Appwrite database.
 * It uses the unique identifier of the saved record to locate and delete it.
 * 
 * @param savedRecordId The unique identifier of the saved post record to be deleted
 * @returns A Promise that resolves to an object with status "ok" if the deletion is successful,
 *          or undefined if an error occurs during the deletion process.
 */

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.saveCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves a specific post from the database by its ID.
 * 
 * This function fetches a single post document from the Appwrite database
 * using the provided post ID. It's useful for displaying detailed information
 * about a specific post or for operations that require the full post data.
 * 
 * @param postId The unique identifier of the post to retrieve
 * @returns A Promise that resolves to the post document if found,
 *          or undefined if the post doesn't exist or an error occurs.
 */

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Updates an existing post in the database.
 * 
 * This function handles the process of updating a post, including:
 * - Uploading a new file if provided
 * - Updating the post's metadata (caption, location, tags)
 * - Handling the replacement of the existing image if a new one is uploaded
 * 
 * @param post An object of type IUpdatePost containing the updated post data
 * @returns A Promise that resolves to the updated post document if successful,
 *          or undefined if an error occurs during the update process.
 */

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // upload file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // get file url
      const fileUrl = getFilePreview(uploadedFile.$id);

      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // convert tags in an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // save post to database
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Deletes a post and its associated image from the database and storage.
 * 
 * @param postId - The ID of the post to be deleted.
 * @param imageId - The ID of the image associated with the post.
 * @returns A promise that resolves to an object with a status of "ok" if successful.
 * @throws Error if postId or imageId is not provided, or if deletion fails.
 * 
 * This function performs two main operations:
 * 1. Deletes the post document from the database using the provided postId.
 * 2. Deletes the associated image file from storage using the provided imageId.
 * 
 * If either operation fails, an error is thrown and logged to the console.
 */

export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) throw Error;
  // delete post from database
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;
    // delete file from storage
    await deleteFile(imageId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

/**
 * Fetches a paginated list of posts from the database.
 * 
 * @param {Object} params - The parameters for the query.
 * @param {number} params.pageParam - The cursor for pagination.
 * @returns {Promise<Object>} A promise that resolves to the list of posts.
 * @throws {Error} If the posts cannot be retrieved.
 * 
 * This function uses Appwrite's query system to:
 * 1. Order posts by their update time in descending order.
 * 2. Limit the number of posts per page to 10.
 * 3. Implement cursor-based pagination using the pageParam.
 * 
 * The function is designed to work with infinite scrolling implementations,
 * allowing for efficient loading of large datasets in smaller chunks.
 */

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(10)];
  
  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Searches for posts in the database that match the given search term.
 * 
 * @param {string} searchTerm - The term to search for in post captions.
 * @returns {Promise<Object>} A promise that resolves to the list of matching posts.
 * @throws {Error} If the posts cannot be retrieved.
 * 
 * This function uses Appwrite's query system to:
 * 1. Search for posts where the caption contains the search term.
 * 
 * The function is useful for implementing search functionality in the application,
 * allowing users to find posts based on keywords or phrases.
 */

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}
