import type { MessageBookmarkDeps } from '../messageBookmark.js';
import { createMessageBookmarkRouter } from '../routes/messageBookmarkRoutes.js';
import {
  invokeExpressRouterRoute,
  type InvokeExpressRouterRouteOptions,
} from './invokeExpressRouterRoute.js';

export async function invokeMessageBookmarkRoute(
  deps: MessageBookmarkDeps,
  options: InvokeExpressRouterRouteOptions,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeExpressRouterRoute(createMessageBookmarkRouter(deps), options);
}
