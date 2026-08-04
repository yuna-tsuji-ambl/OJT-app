import type { MessageAnnouncementDeps } from '../messageAnnouncement.js';
import { createMessageAnnouncementRouter } from '../routes/messageAnnouncementRoutes.js';
import {
  invokeExpressRouterRoute,
  type InvokeExpressRouterRouteOptions,
} from './invokeExpressRouterRoute.js';

export async function invokeMessageAnnouncementRoute(
  deps: MessageAnnouncementDeps,
  options: InvokeExpressRouterRouteOptions,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeExpressRouterRoute(
    createMessageAnnouncementRouter(deps),
    options,
  );
}
