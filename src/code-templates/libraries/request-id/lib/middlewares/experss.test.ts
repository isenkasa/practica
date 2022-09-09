import axios, { Method, AxiosInstance } from 'axios';
import express from 'express';
import { requestIdExpressMiddleware } from './experss';
import { REQUEST_ID_HEADER } from './header-name';
import { Server } from 'http';
import { AddressInfo } from 'net';

describe('express Middleware', () => {
  const route = '/some-route';
  let server: Server;
  let axiosAPIClient: AxiosInstance;

  beforeAll(async () => {
    const expressApp = express();
    expressApp.use(requestIdExpressMiddleware);
    expressApp.all(route, (req, res) => {
      res.json({
        reqRequestId: req.headers[REQUEST_ID_HEADER],
        resRequestId: res.getHeader(REQUEST_ID_HEADER),
      });
    });

    await new Promise<void>((resolve) => {
      server = expressApp.listen(0, resolve);
    });

    const axiosConfig = {
      baseURL: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
      validateStatus: () => true,
    };
    axiosAPIClient = axios.create(axiosConfig);
  });

  afterAll(async () => {
    new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  });

  describe('when the response is successful', () => {
    describe.each`
      method       | body
      ${'GET'}     | ${undefined}
      ${'POST'}    | ${{}}
      ${'PUT'}     | ${{}}
      ${'PATCH'}   | ${{}}
      ${'DELETE'}  | ${{}}
      ${'HEAD'}    | ${{}}
      ${'OPTIONS'} | ${{}}
    `(
      '$method',
      ({
        method,
        body,
      }: {
        method: Method;
        body: undefined | Record<string, any>;
      }) => {
        it('should have request id in the request when missing in header', async () => {
          // Act
          const response = await axiosAPIClient.request({
            url: route,
            method,
            data: body,
          });

          // Assert
          expect(response.data).toEqual({
            reqRequestId: expect.any(String),
            resRequestId: expect.any(String),
          });
          expect(response.data.reqRequestId).toEqual(
            response.data.resRequestId
          );
        });

        it('should add to the response headers the request id that generated', async () => {
          // Act
          const response = await axiosAPIClient.request({
            url: route,
            method,
            data: body,
          });

          // Assert
          expect(response.headers[REQUEST_ID_HEADER]).toEqual(
            response.data.resRequestId
          );
        });

        it('should use the request id from the request header', async () => {
          // Arrange
          const requestId = 'f3108f31-0ccc-4f5f-ae82-7a7daa99c44c';

          // Act
          const response = await axiosAPIClient.request({
            url: route,
            method,
            data: body,
            headers: {
              [REQUEST_ID_HEADER]: requestId,
            },
          });

          // Assert
          expect(response.data).toEqual({
            reqRequestId: requestId,
            resRequestId: requestId,
          });
        });

        it('should add to the response headers the request id from header', async () => {
          // Arrange
          const requestId = 'f3108f31-0ccc-4f5f-ae82-7a7daa99c44c';

          // Act
          const response = await axiosAPIClient.request({
            url: route,
            method,
            data: body,
            headers: {
              [REQUEST_ID_HEADER]: requestId,
            },
          });

          // Assert
          expect(response.headers[REQUEST_ID_HEADER]).toEqual(requestId);
        });
      }
    );
  });

  it('should generate request id even if the route is missing and no request id in the request headers', async () => {
    // Act
    const response = await axiosAPIClient.get(route + 'missing');

    // Assert
    expect(response.status).toEqual(404);
    expect(response.headers[REQUEST_ID_HEADER]).toEqual(expect.any(String));
  });

  it('should return the request request id header value even if the route is missing', async () => {
    // Arrange
    const requestId = 'f3108f31-0ccc-4f5f-ae82-7a7daa99c44c';

    // Act
    const response = await axiosAPIClient.get(route + 'missing', {
      headers: {
        [REQUEST_ID_HEADER]: requestId,
      },
    });

    // Assert
    expect(response.status).toEqual(404);
    expect(response.headers[REQUEST_ID_HEADER]).toEqual(expect.any(String));
  });

  it.todo('test store');
});
