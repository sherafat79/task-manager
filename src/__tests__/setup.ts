import {beforeAll, afterEach, afterAll} from "vitest";
import {server} from "@/mocks/server";
import "@testing-library/jest-dom";

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
