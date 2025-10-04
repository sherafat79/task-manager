# Design Document

## Overview

The Resilient Task Manager is built on Next.js 15 with the App Router, leveraging React 19 features. The architecture emphasizes complete frontend-backend decoupling through Mock Service Worker (MSW), with React Query managing all server state. The application uses Material UI v6 with RTL configuration for Persian language support and the Vazir font family.

The key architectural decision is treating the mock API as a first-class citizen—not just a testing tool, but the primary data layer during development. This approach ensures the frontend is truly decoupled and can seamlessly transition to a real backend by simply swapping MSW handlers for actual API endpoints.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Components (UI Layer)              │  │
│  │  - TaskList, TaskCard, TaskForm, AddTaskDialog       │  │
│  │  - Material UI Components with RTL                    │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                            │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │         React Query Hooks (State Layer)              │  │
│  │  - useTasks, useCreateTask, useUpdateTask            │  │
│  │  - useDeleteTask, useToggleTask                      │  │
│  │  - Query invalidation & cache management             │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                            │
└──────────────────┼────────────────────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────────────────────┐
│              Mock Service Worker (MSW)                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  REST API Handlers                                     │  │
│  │  - GET /api/tasks                                      │  │
│  │  - POST /api/tasks                                     │  │
│  │  - PUT /api/tasks/:id                                  │  │
│  │  - DELETE /api/tasks/:id                               │  │
│  │  - Network latency simulation (500ms)                 │  │
│  │  - Random error injection (500, 404)                  │  │
│  └────────────────┬───────────────────────────────────────┘  │
│                   │                                            │
│  ┌────────────────▼───────────────────────────────────────┐  │
│  │         In-Memory Database (localStorage)             │  │
│  │  - Task persistence across page refreshes             │  │
│  │  - CRUD operations with ID generation                 │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 15.5.4 with App Router
- **React**: 19.1.0 (with React Compiler support)
- **State Management**: @tanstack/react-query v5
- **Mock API**: msw v2 (Mock Service Worker)
- **UI Library**: @mui/material v6
- **Styling**: Material UI's emotion-based styling system
- **Typography**: Vazir font (loaded via next/font/local)
- **Testing**: Vitest, React Testing Library, MSW for test mocking
- **Type Safety**: TypeScript 5 with strict mode

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Main task manager page
│   └── globals.css                # Global styles & Vazir font
├── components/
│   ├── TaskList.tsx               # Main task list container
│   ├── TaskCard.tsx               # Individual task card
│   ├── TaskForm.tsx               # Task creation/edit form
│   ├── AddTaskDialog.tsx          # Dialog for adding tasks
│   ├── EditTaskDialog.tsx         # Dialog for editing tasks
│   ├── TaskSkeleton.tsx           # Loading skeleton
│   └── EmptyState.tsx             # Empty state component
├── hooks/
│   ├── useTasks.ts                # Query hook for fetching tasks
│   ├── useCreateTask.ts           # Mutation hook for creating
│   ├── useUpdateTask.ts           # Mutation hook for updating
│   ├── useDeleteTask.ts           # Mutation hook for deleting
│   └── useToggleTask.ts           # Mutation hook for toggling
├── lib/
│   ├── queryClient.ts             # React Query client config
│   ├── theme.ts                   # Material UI theme with RTL
│   └── api.ts                     # API client functions
├── types/
│   ├── task.ts                    # Task type definitions
│   └── api.ts                     # API response/error types
├── mocks/
│   ├── browser.ts                 # MSW browser setup
│   ├── handlers.ts                # MSW request handlers
│   ├── db.ts                      # Mock database logic
│   └── server.ts                  # MSW server for tests
└── __tests__/
    ├── TaskList.test.tsx          # Integration tests
    ├── TaskOperations.test.tsx    # CRUD operation tests
    └── ErrorHandling.test.tsx     # Error scenario tests
```

## Components and Interfaces

### Core Types

```typescript
// types/task.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

// types/api.ts
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

### React Query Hooks

```typescript
// hooks/useTasks.ts
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    staleTime: 30000, // 30 seconds
  });
}

// hooks/useCreateTask.ts
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      toast.success("تسک با موفقیت ایجاد شد");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "خطا در ایجاد تسک");
    },
  });
}

// Similar patterns for useUpdateTask, useDeleteTask, useToggleTask
```

### MSW Handler Design

```typescript
// mocks/handlers.ts
export const handlers = [
  http.get("/api/tasks", async () => {
    await delay(500); // Simulate network latency

    if (shouldSimulateError()) {
      return HttpResponse.json({message: "خطای سرور"}, {status: 500});
    }

    const tasks = db.getTasks();
    return HttpResponse.json({data: tasks});
  }),

  http.post("/api/tasks", async ({request}) => {
    await delay(500);

    if (shouldSimulateError()) {
      return HttpResponse.json({message: "خطا در ایجاد تسک"}, {status: 500});
    }

    const body = await request.json();
    const newTask = db.createTask(body);
    return HttpResponse.json({data: newTask}, {status: 201});
  }),

  // PUT and DELETE handlers follow similar patterns
];

// Error simulation with 10% probability
function shouldSimulateError(): boolean {
  return Math.random() < 0.1;
}
```

### Mock Database

```typescript
// mocks/db.ts
class MockDatabase {
  private storageKey = "resilient-task-manager-tasks";

  getTasks(): Task[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  createTask(input: CreateTaskInput): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...input,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  updateTask(id: string, input: UpdateTaskInput): Task | null {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.saveTasks(tasks);
    return tasks[index];
  }

  deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);

    if (filtered.length === tasks.length) return false;

    this.saveTasks(filtered);
    return true;
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }
}

export const db = new MockDatabase();
```

## Data Models

### Task Entity

The Task entity represents a single to-do item with the following properties:

- **id**: Unique identifier (UUID v4)
- **title**: Task title (required, max 200 characters)
- **description**: Task description (optional, max 1000 characters)
- **completed**: Boolean flag for completion status
- **createdAt**: ISO 8601 timestamp of creation
- **updatedAt**: ISO 8601 timestamp of last update

### State Management Flow

1. **Initial Load**: React Query fetches tasks via `useTasks()` hook
2. **Cache Strategy**: Tasks are cached for 30 seconds (staleTime)
3. **Background Refetch**: Automatic refetch on window focus
4. **Optimistic Updates**: Not implemented initially to showcase loading states
5. **Invalidation**: Manual invalidation after successful mutations

## Material UI Theme Configuration

### RTL Support

```typescript
// lib/theme.ts
import {createTheme} from "@mui/material/styles";
import {prefixer} from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

export const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "Vazir, Arial, sans-serif",
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: "rtl",
        },
      },
    },
  },
});

// RTL cache for emotion
export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
```

### Provider Setup

```typescript
// app/layout.tsx
import {CacheProvider} from "@emotion/react";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {QueryClientProvider} from "@tanstack/react-query";
import {theme, cacheRtl} from "@/lib/theme";
import {queryClient} from "@/lib/queryClient";

export default function RootLayout({children}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
```

## Error Handling

### Error Types

1. **Network Errors**: Connection failures, timeouts
2. **Server Errors**: 500 Internal Server Error
3. **Client Errors**: 404 Not Found, 400 Bad Request
4. **Validation Errors**: Invalid input data

### Error Handling Strategy

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30000,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
      onError: (error: ApiError) => {
        // Global error handling
        console.error("Mutation error:", error);
      },
    },
  },
});
```

### Toast Notifications

Using `react-hot-toast` for user feedback:

```typescript
// Success messages
toast.success("تسک با موفقیت ایجاد شد");
toast.success("تسک با موفقیت ویرایش شد");
toast.success("تسک با موفقیت حذف شد");

// Error messages
toast.error("خطا در ایجاد تسک. لطفا دوباره تلاش کنید");
toast.error("خطا در ویرایش تسک. لطفا دوباره تلاش کنید");
toast.error("خطا در حذف تسک. لطفا دوباره تلاش کنید");
```

## Testing Strategy

### Test Environment Setup

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    globals: true,
  },
});

// __tests__/setup.ts
import {beforeAll, afterEach, afterAll} from "vitest";
import {server} from "@/mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Test Categories

#### 1. Happy Path Tests

```typescript
test("displays tasks after successful fetch", async () => {
  render(<TaskList />);

  // Wait for loading to finish
  await waitForElementToBeRemoved(() => screen.queryByTestId("task-skeleton"));

  // Assert tasks are displayed
  expect(screen.getByText("Sample Task")).toBeInTheDocument();
});
```

#### 2. Loading State Tests

```typescript
test("shows skeleton loaders while fetching", () => {
  render(<TaskList />);

  // Assert skeleton is visible
  expect(screen.getByTestId("task-skeleton")).toBeInTheDocument();
});
```

#### 3. Error State Tests

```typescript
test("displays error message when fetch fails", async () => {
  // Override handler to return error
  server.use(
    http.get("/api/tasks", () => {
      return HttpResponse.json({message: "خطای سرور"}, {status: 500});
    })
  );

  render(<TaskList />);

  // Wait for error message
  await screen.findByText(/خطا در بارگذاری/i);
  expect(screen.getByText(/خطا در بارگذاری/i)).toBeInTheDocument();
});
```

#### 4. CRUD Operation Tests

```typescript
test("creates a new task successfully", async () => {
  render(<TaskList />);

  // Open dialog
  const addButton = screen.getByRole("button", {name: /افزودن تسک/i});
  await userEvent.click(addButton);

  // Fill form
  await userEvent.type(screen.getByLabelText(/عنوان/i), "New Task");
  await userEvent.type(screen.getByLabelText(/توضیحات/i), "Description");

  // Submit
  await userEvent.click(screen.getByRole("button", {name: /ذخیره/i}));

  // Assert new task appears
  await screen.findByText("New Task");
  expect(screen.getByText("New Task")).toBeInTheDocument();
});
```

### Test Coverage Goals

- **Unit Tests**: 80% coverage for utility functions and hooks
- **Integration Tests**: 90% coverage for user flows
- **E2E Tests**: Critical paths (add, edit, delete, toggle)

## Performance Considerations

### React Query Optimizations

1. **Stale Time**: 30 seconds to reduce unnecessary refetches
2. **Cache Time**: 5 minutes to keep data in memory
3. **Refetch on Focus**: Enabled for data freshness
4. **Retry Logic**: 2 retries with exponential backoff

### Component Optimizations

1. **React.memo**: Memoize TaskCard components
2. **useCallback**: Memoize event handlers
3. **Lazy Loading**: Code-split dialogs with React.lazy
4. **Virtualization**: Not needed initially (implement if >100 tasks)

### Bundle Size

- Material UI tree-shaking enabled
- MSW only loaded in development/test environments
- Next.js automatic code splitting

## Security Considerations

### Input Validation

```typescript
// Validation schema (using zod)
const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});
```

### XSS Prevention

- Material UI components escape content by default
- No `dangerouslySetInnerHTML` usage
- Sanitize user input before storage

### Data Persistence

- localStorage is domain-scoped
- No sensitive data stored
- Clear data on logout (future feature)

## Deployment Considerations

### MSW in Production

MSW should be disabled in production builds:

```typescript
// app/layout.tsx
if (process.env.NODE_ENV === "development") {
  const {worker} = await import("@/mocks/browser");
  await worker.start();
}
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api  # Development
NEXT_PUBLIC_API_URL=https://api.example.com    # Production
```

### Build Configuration

```typescript
// next.config.ts
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
};
```

## Future Enhancements

1. **Optimistic Updates**: Immediate UI updates before API confirmation
2. **Offline Support**: Service Worker for offline functionality
3. **Real-time Sync**: WebSocket integration for multi-device sync
4. **Task Categories**: Organize tasks by categories/tags
5. **Due Dates**: Add deadline functionality with reminders
6. **Search & Filter**: Advanced task filtering and search
7. **Drag & Drop**: Reorder tasks with drag-and-drop
8. **Dark Mode**: Theme toggle for dark mode support
