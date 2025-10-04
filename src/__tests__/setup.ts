/**
 * Test environment setup for Vitest
 * Configures MSW server and necessary browser API mocks
 */

import {beforeAll, afterEach, afterAll} from "vitest";
import {server} from "@/mocks/server";
import "@testing-library/jest-dom";

/**
 * Mock matchMedia API for components that use media queries
 * Required for react-hot-toast and Material UI components
 */
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

/**
 * Start MSW server before all tests
 * Intercepts network requests and responds with mock data
 */
beforeAll(() => {
  server.listen({onUnhandledRequest: "error"});
});

/**
 * Reset MSW handlers after each test
 * Ensures test isolation by clearing any custom handlers
 */
afterEach(() => {
  server.resetHandlers();
});

/**
 * Clean up MSW server after all tests complete
 */
afterAll(() => {
  server.close();
});
