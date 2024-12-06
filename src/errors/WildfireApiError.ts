import { ApiError } from './ApiError';

export class WildfireApiError extends ApiError {
  constructor(
    message: string,
    status: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    requestUrl: string,
    requestMethod: ApiError['request']['method'],
  ) {
    super(
      { url: requestUrl, method: requestMethod },
      { url: requestUrl, ok: false, status, statusText: '', body },
      message,
    );
    this.name = 'WildfireApiError';
  }
}
