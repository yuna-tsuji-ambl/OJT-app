import type { Request, Response } from 'express';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { createConditionRouter } from '../routes/conditionRoutes.js';

type HttpMethod = 'get' | 'post';

interface InvokeConditionRouteOptions {
  method: HttpMethod;
  path: string;
  params?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function invokeConditionRoute(
  conditionRecordStore: ConditionRecordStore,
  {
    method,
    path,
    params = {},
    body,
    headers = {},
  }: InvokeConditionRouteOptions,
): Promise<{ statusCode: number; body: unknown }> {
  const router = createConditionRouter(conditionRecordStore);
  const routeLayer = router.stack.find(
    (layer) =>
      layer.route?.path === path && layer.route.methods[method] === true,
  );
  const handler = routeLayer?.route?.stack[0]?.handle;

  if (!handler) {
    throw new Error(`${method.toUpperCase()} ${path} handler not found`);
  }

  const request = {
    body,
    header(name: string) {
      const normalizedName = name.toLowerCase();
      return headers[normalizedName] ?? headers[name] ?? undefined;
    },
    params,
  } as Request;

  let statusCode = 200;
  let responseBody: unknown;

  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      responseBody = payload;
      return this;
    },
  } as Response;

  await Promise.resolve(handler(request, response, () => undefined));
  await new Promise((resolve) => setImmediate(resolve));

  return { statusCode, body: responseBody };
}
