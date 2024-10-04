import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

/**
 * The queryClient object is an instance of QueryClient from react-query.
 * It is responsible for managing the caching, fetching, and updating of data in the application.
 * This object will be provided to the entire application through the QueryClientProvider component. 
 * 
 */ 

const queryClient = new QueryClient();

export const QueryProvider = ({children}:{children:React.ReactNode}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
