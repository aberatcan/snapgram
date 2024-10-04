import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  createPost,
  createUserAccount,
  deletePost,
  deleteSavedPost,
  getCurrentUser,
  getInfinitePosts,
  getPostById,
  getRecentPosts,
  getUsers,
  likePost,
  savePost,
  searchPosts,
  signInAccount,
  signOutAccount,
  updatePost,
} from "../appwrite/api";
import { INewPost, INewUser, IUpdatePost } from "@/types";
import { QUERY_KEYS } from "./queryKeys";

/**
 * Hook for creating a new user account.
 * 
 * This hook uses the useMutation function from react-query to handle the account creation process.
 * It takes a user object of type INewUser as an argument and calls the createUserAccount function.
 * 
 * @returns A mutation object that can be used to trigger the account creation process
 * and handle its lifecycle (loading, success, error states).
 */

export const useCreateUserAccount = () => {
  /**
   * The useMutation function is a hook provided by react-query for handling asynchronous mutations.
   * It's used for operations that change data, such as creating, updating, or deleting resources.
   * 
   * Key features of useMutation:
   * 1. Handles loading, error, and success states automatically.
   * 2. Provides callbacks for different stages of the mutation (onMutate, onError, onSuccess, onSettled).
   * 3. Can be used to optimistically update the UI before the server responds.
   * 4. Integrates well with the rest of react-query's caching and invalidation system.
   * 
   * In this case, it's used to handle the account creation process, providing a clean way to trigger
   * the mutation and manage its lifecycle.
   */
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

/**
 * Hook for signing in a user account.
 * 
 * This hook uses the useMutation function from react-query to handle the sign-in process.
 * It takes an object with email and password properties as an argument and calls the signInAccount function.
 * 
 * @returns A mutation object that can be used to trigger the sign-in process
 * and handle its lifecycle (loading, success, error states).
 */

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

/**
 * Hook for signing out a user account.
 * 
 * This hook uses the useMutation function from react-query to handle the sign-out process.
 * It calls the signOutAccount function without any arguments.
 * 
 * @returns A mutation object that can be used to trigger the sign-out process
 * and handle its lifecycle (loading, success, error states).
 */

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

/**
 * Hook for creating a new post.
 * 
 * This hook uses the useMutation function from react-query to handle the post creation process.
 * It takes an INewPost object as an argument and calls the createPost function.
 * 
 * Key features:
 * 1. Uses useQueryClient to access the QueryClient instance.
 * 2. Automatically invalidates the GET_RECENT_POSTS query on successful post creation.
 * 3. This invalidation triggers a refetch of recent posts, ensuring the UI is up-to-date.
 * 
 * @returns A mutation object that can be used to trigger the post creation process
 * and handle its lifecycle (loading, success, error states).
 */

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      // beauty of react-query. invalidate getRecentPost query after user create a new one.
      // refresh the get recent query cache after the post creation
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

/**
 * Hook for fetching recent posts.
 * 
 * This hook uses the useQuery function from react-query to handle fetching recent posts.
 * It calls the getRecentPosts function without any arguments.
 * 
 * Key features:
 * 1. Uses QUERY_KEYS.GET_RECENT_POSTS as the query key for caching and invalidation.
 * 2. Automatically handles caching, refetching, and updating of recent posts data.
 * 
 * @returns A query object that includes the fetched data, loading state, and error state.
 * This can be used to render recent posts or handle loading/error states in the UI.
 */

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

/**
 * Hook for liking a post.
 * 
 * This hook uses the useMutation function from react-query to handle the post liking process.
 * It takes an object with postId and likesArray as arguments and calls the likePost function.
 * 
 * Key features:
 * 1. Uses useQueryClient to access the QueryClient instance.
 * 2. Automatically invalidates multiple queries on successful like action:
 *    - GET_POST_BY_ID: To update the specific post's like count.
 *    - GET_RECENT_POSTS: To reflect changes in recent posts list.
 *    - GET_POSTS: To update the general posts list.
 *    - GET_CURRENT_USER: To update user's liked posts.
 * 3. This invalidation triggers refetches, ensuring the UI is up-to-date across different views.
 * 
 * @returns A mutation object that can be used to trigger the post liking process
 * and handle its lifecycle (loading, success, error states).
 */

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),

    // invalidate the cache after the mutation is successful
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

/**
 * Hook for saving a post.
 * 
 * This hook uses the useMutation function from react-query to handle the post saving process.
 * It takes an object with postId and userId as arguments and calls the savePost function.
 * 
 * Key features:
 * 1. Uses useQueryClient to access the QueryClient instance.
 * 2. Automatically invalidates multiple queries on successful save action:
 *    - GET_RECENT_POSTS: To reflect changes in recent posts list.
 *    - GET_POSTS: To update the general posts list.
 *    - GET_CURRENT_USER: To update user's saved posts.
 * 3. This invalidation triggers refetches, ensuring the UI is up-to-date across different views.
 * 
 * @returns A mutation object that can be used to trigger the post saving process
 * and handle its lifecycle (loading, success, error states).
 */

export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      savePost(postId, userId),

    // invalidate the cache after the mutation is successful
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

/**
 * Hook for deleting a saved post.
 * 
 * This hook uses the useMutation function from react-query to handle the process of deleting a saved post.
 * It takes an object with savedRecordId as an argument and calls the deleteSavedPost function.
 * 
 * Key features:
 * 1. Uses useQueryClient to access the QueryClient instance.
 * 2. Automatically invalidates multiple queries on successful deletion:
 *    - GET_RECENT_POSTS: To reflect changes in recent posts list.
 *    - GET_POSTS: To update the general posts list.
 *    - GET_CURRENT_USER: To update user's saved posts.
 * 3. This invalidation triggers refetches, ensuring the UI is up-to-date across different views.
 * 
 * @returns A mutation object that can be used to trigger the saved post deletion process
 * and handle its lifecycle (loading, success, error states).
 */

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ savedRecordId }: { savedRecordId: string }) =>
      deleteSavedPost(savedRecordId),

    // invalidate the cache after the mutation is successful
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

/**
 * Hook for fetching the current user's data.
 * 
 * This hook uses the useQuery function from react-query to handle the process of fetching the current user's information.
 * 
 * Key features:
 * 1. Uses the GET_CURRENT_USER query key to uniquely identify this query.
 * 2. Calls the getCurrentUser function to fetch the user data.
 * 3. Automatically handles caching, refetching, and stale data management.
 * 
 * @returns A query object that includes the current user's data, loading state, and error state.
 *          This can be used to access the user information and handle different states in the UI.
 */

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

/**
 * Hook for fetching a specific post by its ID.
 * 
 * This hook uses the useQuery function from react-query to handle the process of fetching a post's information.
 * 
 * Key features:
 * 1. Uses the GET_POST_BY_ID query key along with the postId to uniquely identify this query.
 * 2. Calls the getPostById function to fetch the post data.
 * 3. The query is only enabled when a postId is provided (enabled: !!postId).
 * 4. Automatically handles caching, refetching, and stale data management.
 * 
 * @param postId - The unique identifier of the post to fetch.
 * @returns A query object that includes the post data, loading state, and error state.
 *          This can be used to access the post information and handle different states in the UI.
 */

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

/**
 * Hook for updating a post.
 * 
 * This hook uses the useMutation function from react-query to handle the process of updating a post.
 * 
 * Key features:
 * 1. Uses the updatePost function as the mutation function.
 * 2. On successful update, it invalidates the queries for recent posts and the specific post,
 *    ensuring that the UI reflects the latest data.
 * 3. Utilizes the useQueryClient hook to access the query client for cache invalidation.
 * 
 * @returns A mutation object that includes the mutate function, loading state, and error state.
 *          This can be used to trigger the post update and handle different states in the UI.
 */

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID],
      });
    },
  });
};

/**
 * Hook for deleting a post.
 * 
 * This hook uses the useMutation function from react-query to handle the process of deleting a post.
 * 
 * Key features:
 * 1. Uses the deletePost function as the mutation function.
 * 2. On successful deletion, it invalidates the query for recent posts,
 *    ensuring that the UI reflects the latest data.
 * 3. Utilizes the useQueryClient hook to access the query client for cache invalidation.
 * 
 * @returns A mutation object that includes the mutate function, loading state, and error state.
 *          This can be used to trigger the post deletion and handle different states in the UI.
 */

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
}

/**
 * Hook for fetching posts.
 * 
 * This hook utilizes the useInfiniteQuery function from react-query to manage the fetching of posts in a paginated manner.
 * 
 * Key features:
 * 1. Uses the getInfinitePosts function as the query function to retrieve posts.
 * 2. Supports infinite scrolling by providing a mechanism to fetch the next page of posts.
 * 3. The initial page parameter is set to 0, indicating the starting point for fetching posts.
 * 
 * @returns An object containing the posts data, loading state, and pagination functions.
 *          This can be used to display posts and manage loading states in the UI.
 */

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts,
    getNextPageParam: (lastPage: any) => {
      if (!lastPage || lastPage.documents.length === 0) return null;
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
    initialPageParam: 0
  })

}

/**
 * Hook for searching posts.
 * 
 * This hook utilizes the useQuery function from react-query to fetch posts based on a search term.
 * 
 * Key features:
 * 1. Uses the searchPosts function as the query function to retrieve posts that match the search term.
 * 2. The query is enabled only when a search term is provided, preventing unnecessary requests.
 * 3. Returns an object containing the search results, loading state, and error state.
 * 
 * @param searchTerm - The term to search for in the posts.
 * @returns An object containing the search results, loading state, and error state.
 *          This can be used to display search results and manage loading states in the UI.
 */

export const useSearchPost = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm
  })
}

/**
 * Hook for fetching users.
 * 
 * This hook utilizes the useQuery function from react-query to fetch a list of users.
 * 
 * Key features:
 * 1. Uses the getUsers function as the query function to retrieve users.
 * 2. Supports an optional limit parameter to control the number of users fetched.
 * 3. Returns an object containing the users data, loading state, and error state.
 * 
 * @param limit - An optional parameter to limit the number of users fetched.
 * @returns An object containing the users data, loading state, and error state.
 *          This can be used to display users and manage loading states in the UI.
 */

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};