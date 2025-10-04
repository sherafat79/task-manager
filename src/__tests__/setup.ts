import {beforeAll, afterEach, afterAll} from "vitest";
import {server} from "@/mocks/server";
import "@testing-library/jest-dom";

// Mock matchMedia for react-hot-toast
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Start MSW server before all tests
beforeAll(() => {
  server.listen({onUnhandledRequest: "error"});
});

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
});
