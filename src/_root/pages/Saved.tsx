import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import GripPostList from "@/components/shared/GridPostList";
import { Models } from "appwrite";
const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();

  const savedPosts = currentUser?.save.map((savedPost: Models.Document) => ({
    ...savedPost.post,
    creator: {
      imageUrl: currentUser.imageUrl,
    },
  }));

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full">
        <img
          src="assets/icons/save.svg"
          alt="saved"
          height={30}
          width={30}
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold w-full">Saved Posts</h2>
      </div>
      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savedPosts.length === 0 ? (
            <h3 className="h3-bold">No saved posts yet</h3>
          ) : (
            <GripPostList posts={savedPosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;
