import type { Request, Response } from 'express';
import type { ReportRepository } from '../repositories/reportRepository.js';
import { createReportRouter } from '../routes/reportRoutes.js';

type HttpMethod = 'get' | 'put';

interface InvokeReportRouteOptions {
  method: HttpMethod;
  path: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function invokeReportRoute(
  reportRepository: ReportRepository,
  {
    method,
    path,
    params = {},
    query = {},
    body,
    headers = {},
  }: InvokeReportRouteOptions,
): Promise<{ statusCode: number; body: unknown }> {
  const router = createReportRouter(reportRepository);
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
    params,
    query,
    header(name: string) {
      const normalizedName = name.toLowerCase();
      return headers[normalizedName] ?? headers[name] ?? undefined;
    },
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
