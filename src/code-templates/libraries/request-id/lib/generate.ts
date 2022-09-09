import { randomUUID } from 'node:crypto';

export const requestIdGenerator: () => string = randomUUID.bind(
  null,
  undefined
);
