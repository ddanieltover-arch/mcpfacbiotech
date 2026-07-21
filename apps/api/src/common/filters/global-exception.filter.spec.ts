import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  function mockHost(statusSpy: jest.Mock, jsonSpy: jest.Mock): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getResponse: () => ({
          status: statusSpy.mockReturnValue({ json: jsonSpy }),
        }),
        getRequest: () => ({
          url: '/api/v1/test',
          method: 'GET',
          headers: {},
        }),
      }),
    } as unknown as ArgumentsHost;
  }

  it('normalizes HttpException into the API error envelope', () => {
    const statusSpy = jest.fn();
    const jsonSpy = jest.fn();
    filter.catch(new HttpException('Nope', HttpStatus.BAD_REQUEST), mockHost(statusSpy, jsonSpy));

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: 'Nope',
      }),
    );
  });

  it('maps validation array messages to errors[]', () => {
    const statusSpy = jest.fn();
    const jsonSpy = jest.fn();
    filter.catch(
      new HttpException(
        { message: ['name must be a string', 'email must be an email'] },
        HttpStatus.BAD_REQUEST,
      ),
      mockHost(statusSpy, jsonSpy),
    );

    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'unknown', message: 'name must be a string' },
          { field: 'unknown', message: 'email must be an email' },
        ],
      }),
    );
  });

  it('hides unexpected error details from clients', () => {
    const statusSpy = jest.fn();
    const jsonSpy = jest.fn();
    filter.catch(new Error('secret db password leaked'), mockHost(statusSpy, jsonSpy));

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        message: 'An unexpected error occurred',
      }),
    );
    expect(JSON.stringify(jsonSpy.mock.calls[0][0])).not.toContain('secret db password');
  });
});
