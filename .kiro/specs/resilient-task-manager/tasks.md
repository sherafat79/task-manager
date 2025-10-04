# Implementation Plan

- [x] 1. Install dependencies and configure project foundation

  - Install @tanstack/react-query, msw, @mui/material, @emotion/react, @emotion/styled, @emotion/cache, stylis, stylis-plugin-rtl, react-hot-toast
  - Install dev dependencies: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
  - Download and configure Vazir font files in public/fonts directory
  - _Requirements: 2.1, 3.1, 6.1, 7.2, 8.1_

- [x] 2. Create TypeScript type definitions

  - Create src/types/task.ts with Task, CreateTaskInput, and UpdateTaskInput interfaces
  - Create src/types/api.ts with ApiError and ApiResponse types
  - _Requirements: 6.1, 6.2_

- [x] 3. Implement mock database layer

  - Create src/mocks/db.ts with MockDatabase class
  - Implement getTasks, createTask, updateTask, deleteTask, and saveTasks methods using localStorage
  - Add UUID generation for task IDs and ISO timestamp handling
  - _Requirements: 2.3, 2.4_

- [x] 4. Set up MSW handlers with network simulation

  - Create src/mocks/handlers.ts with REST API handlers for GET, POST, PUT, DELETE /api/tasks
  - Implement 500ms network latency simulation using delay function
  - Implement random error injection (10% probability) for 500 and 404 responses
  - Add proper error response messages in Persian
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 5. Configure MSW for browser and test environments

  - Create src/mocks/browser.ts with MSW worker setup for development
  - Create src/mocks/server.ts with MSW server setup for testing
  - _Requirements: 2.1, 8.1_

- [x] 6. Set up React Query client with error handling

  - Create src/lib/queryClient.ts with QueryClient configuration
  - Configure retry logic, staleTime, and refetchOnWindowFocus options
  - Add global error handling for mutations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 7. Create API client functions

  - Create src/lib/api.ts with fetchTasks, createTask, updateTask, deleteTask, and toggleTask functions
  - Implement proper error handling and type safety for all API calls
  - _Requirements: 3.1, 6.3, 6.4_

- [x] 8. Implement React Query hooks for task operations

  - Create src/hooks/useTasks.ts with useQuery hook for fetching tasks
  - Create src/hooks/useCreateTask.ts with useMutation hook and success/error toast notifications
  - Create src/hooks/useUpdateTask.ts with useMutation hook and query invalidation
  - Create src/hooks/useDeleteTask.ts with useMutation hook and success feedback
  - Create src/hooks/useToggleTask.ts with useMutation hook for toggling completion status
  - _Requirements: 3.1, 3.2, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 6.3_

- [x] 9. Configure Material UI theme with RTL and Vazir font

  - Create src/lib/theme.ts with Material UI theme configuration
  - Set direction to 'rtl' and configure Vazir font family
  - Create RTL cache using emotion with stylis-plugin-rtl
  - Configure color palette and component overrides
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 10. Update root layout with providers

  - Modify src/app/layout.tsx to include CacheProvider, ThemeProvider, CssBaseline, and QueryClientProvider
  - Add MSW worker initialization for development environment only
  - Configure HTML lang="fa" and dir="rtl" attributes
  - Add Toaster component from react-hot-toast
  - _Requirements: 2.1, 3.1, 7.3_

- [x] 11. Add Vazir font to global styles

  - Update src/app/globals.css to include @font-face declarations for Vazir font
  - Configure font-display: swap for performance
  - _Requirements: 7.2_

- [x] 12. Create loading skeleton component

  - Create src/components/TaskSkeleton.tsx using Material UI Skeleton components
  - Design skeleton to match TaskCard layout with title and description placeholders
  - _Requirements: 5.1, 8.3_

- [x] 13. Create empty state component

  - Create src/components/EmptyState.tsx with Persian message and icon
  - Use Material UI Typography and Box components
  - _Requirements: 5.4_

- [x] 14. Implement TaskCard component

  - Create src/components/TaskCard.tsx using Material UI Card, CardContent, CardActions
  - Add checkbox for completion toggle, edit button, and delete button
  - Display task title, description, and timestamps
  - Show loading spinner on buttons during operations
  - Implement proper RTL layout and Vazir font rendering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.2, 7.1, 7.4, 7.5_

- [x] 15. Implement TaskForm component

  - Create src/components/TaskForm.tsx with Material UI TextField components
  - Add form validation using controlled inputs
  - Include Persian labels and placeholders for title and description fields
  - Display validation errors in Persian using Material UI error styling
  - _Requirements: 1.1, 1.2, 7.6, 7.7_

-

- [x] 16. Create AddTaskDialog component

  - Create src/components/AddTaskDialog.tsx using Material UI Dialog
  - Integrate TaskForm component for task creation
  - Wire up useCreateTask hook with loading states
  - Handle dialog open/close state and form reset
  - _Requirements: 1.1, 4.2, 5.2_

- [x] 17. Create EditTaskDialog component

  - Create src/components/EditTaskDialog.tsx using Material UI Dialog
  - Integrate TaskForm component with pre-filled values for editing
  - Wire up useUpdateTask hook with loading states
  - Handle dialog open/close state
  - _Requirements: 1.2, 4.3, 5.2_

- [x] 18. Implement TaskList component

  - Create src/components/TaskList.tsx as main container component
  - Use useTasks hook to fetch and display tasks
  - Render TaskSkeleton during loading state
  - Render EmptyState when no tasks exist
  - Render TaskCard components for each task with proper spacing
  - Add floating action button for adding new tasks
  - Handle error states with error message display in Persian
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.5, 3.6, 4.1, 4.5, 5.1, 5.3, 5.4, 5.5, 7.1_

- [x] 19. Update main page to render TaskList

  - Modify src/app/page.tsx to render TaskList component
  - Add page title and container layout using Material UI Container and Typography
  - _Requirements: 7.1_

- [x] 20. Set up Vitest testing environment

  - Create vitest.config.ts with jsdom environment configuration
  - Create src/**tests**/setup.ts with MSW server initialization (beforeAll, afterEach, afterAll)
  - Configure test globals and setupFiles
  - _Requirements: 8.1, 8.2_

- [x] 21. Write happy path integration tests

  - Create src/**tests**/TaskList.test.tsx
  - Write test to verify tasks are displayed correctly after successful API fetch
  - Write test to verify task creation flow with form submission
  - Write test to verify task deletion removes task from list
  - Write test to verify task toggle changes completion status
  - _Requirements: 8.2, 8.5, 8.6, 8.7_

- [x] 22. Write loading state tests

  - Add tests to src/**tests**/TaskList.test.tsx
  - Write test to verify skeleton loaders appear during initial fetch
  - Write test to verify loading spinner appears on buttons during mutations
  - _Requirements: 8.3_

- [x] 23. Write error handling tests

  - Create src/**tests**/ErrorHandling.test.tsx
  - Override MSW handlers to return 500 error and verify error toast is displayed
  - Override MSW handlers to return 404 error for specific task operations
  - Write test to verify error messages are shown in Persian
  - Write test to verify retry logic works correctly
  - _Requirements: 8.4, 8.8_

- [x] 24. Add package.json test script

  - Update package.json to add "test" script running vitest
  - Add "test:ui" script for vitest UI mode
  - Add "test:coverage" script for coverage reports
  - _Requirements: 8.1_

- [x] 25. Implement proper code organization

  - Verify all files are in correct directories per design document structure
  - Ensure consistent naming conventions across components, hooks, and utilities
  - Add JSDoc comments to complex functions and hooks
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
