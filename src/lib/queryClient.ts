import {QueryClient} from "@tanstack/react-query";

/**
 * React Query client configuration with error handling and retry logic
 *
 * Configuration includes:
 * - Retry logic with exponential backoff
 * - 30-second stale time for caching
 * - Automatic refetch on window focus
 * - Global error handling for mutations
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests up to 2 times
      retry: 2,

      // Exponential backoff: 1s, 2s, 4s (capped at 30s)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Consider data fresh for 30 seconds
      staleTime: 30000,

      // Refetch when user returns to the window
      refetchOnWindowFocus: true,

      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Global error handler for all mutations
      onError: (error) => {
        // Log errors for debugging
        console.error("Mutation error:", error);

        // Individual mutation hooks will handle user-facing error messages
        // This is just for global error tracking/logging
      },
    },
  },
});
