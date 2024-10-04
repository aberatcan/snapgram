import { Models } from 'appwrite';
import Loader from './Loader';
import GridPostList from './GridPostList';

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.DocumentList<Models.Document> | undefined;
}

/**
 * This is the SearchResults component.
 * 
 * - Used to display the search results.
 */

const SearchResults = ({isSearchFetching, searchedPosts}:SearchResultsProps) => {

    if(isSearchFetching){
      return (
        <div className='flex-center w-full h-full'>
          <Loader/>
        </div>
      )
    }
    if(searchedPosts && searchedPosts.documents.length > 0){
        return (
            <GridPostList posts={searchedPosts.documents}/>
        )
    }
  
    return (
    <p className='text-light-4 mt-10 text-center w-full'>No results found</p>
  )
}

export default SearchResults