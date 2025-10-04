import {setupWorker} from "msw/browser";
import {handlers} from "./handlers";

/**
 * MSW worker for browser environment (development)
 * This intercepts network requests in the browser and responds with mock data
 */
export const worker = setupWorker(...handlers);
