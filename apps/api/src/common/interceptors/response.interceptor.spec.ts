import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  const interceptor = new ResponseInterceptor();

  function run(
    request: Record<string, unknown>,
    response: { getHeader: jest.Mock; setHeader: jest.Mock },
    data: unknown,
  ) {
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as never;

    return new Promise((resolve) => {
      interceptor.intercept(context, { handle: () => of(data) } as never).subscribe(resolve);
    });
  }

  it('wraps payloads in the success envelope with requestId', async () => {
    const setHeader = jest.fn();
    const result = await run(
      { headers: {}, id: 'req-1' },
      { getHeader: jest.fn().mockReturnValue(undefined), setHeader },
      { message: 'Ok', data: { id: 1 } },
    );

    expect(result).toEqual({
      success: true,
      message: 'Ok',
      data: { id: 1 },
      metadata: expect.objectContaining({ requestId: 'req-1' }),
    });
    expect(setHeader).toHaveBeenCalledWith('X-Request-ID', 'req-1');
  });

  it('passes through raw responses', async () => {
    const result = await run(
      { headers: { 'x-request-id': 'hdr-1' } },
      { getHeader: jest.fn().mockReturnValue('hdr-1'), setHeader: jest.fn() },
      { raw: Buffer.from('pdf') },
    );

    expect(result).toEqual(Buffer.from('pdf'));
  });
});
