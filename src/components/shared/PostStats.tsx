import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import { useEffect, useState } from "react";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const likesList = post.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutateAsync: likePost } = useLikePost();
  const { mutateAsync: savePost } = useSavePost();
  const { mutateAsync: deleteSavedPost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post.$id
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (e: React.MouseEvent) => {
    // Prevent the click event from bubbling up to the parent element
    e.stopPropagation();

    let newLikes = [...likes]

    const hasLiked = newLikes.includes(userId);
  
    // If the user has already liked the post, remove the like
    if(hasLiked){
        newLikes = newLikes.filter((id) => id !== userId)   
    }

    // If the user has not liked the post, add the like
    else {
        newLikes.push(userId);
    }
    // Update the state with the new likes array
    setLikes(newLikes);

    // Call the likePost mutation
    likePost({ postId: post.$id, likesArray: newLikes });
  };

  const handleSavePost = ( e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    // Prevent the click event from bubbling up to the parent element
    e.stopPropagation();

    // If the post is already saved, delete the saved post
    if(savedPostRecord){
        setIsSaved(false)
        deleteSavedPost({ savedRecordId: savedPostRecord.$id });
    } else {
        savePost({ postId: post.$id, userId });
        setIsSaved(true);
    }
  };

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-2">
        <img
          src={
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>
      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="like"
          width={20}
          height={20}
          onClick={handleSavePost}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PostStats;
