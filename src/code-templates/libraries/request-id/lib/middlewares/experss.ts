import type { NextFunction, Request, Response } from 'express';
import { requestIdGenerator } from '../generate';
import { context } from '@practica/async-local-storage';
import { REQUEST_ID_HEADER } from './header-name';

export function requestIdExpressMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let requestId = req.headers[REQUEST_ID_HEADER] || requestIdGenerator();
  if (!req.headers[REQUEST_ID_HEADER]) {
    req.headers[REQUEST_ID_HEADER] = requestId;
  }

  res.setHeader(REQUEST_ID_HEADER, requestId);

  const store = context().getStore();
  if (store) {
    store.requestId = requestId;
  }

  next();
}
