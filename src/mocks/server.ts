import {setupServer} from "msw/node";
import {handlers} from "./handlers";

/**
 * MSW server for Node.js environment (testing)
 * This intercepts network requests during tests and responds with mock data
 */
export const server = setupServer(...handlers);
