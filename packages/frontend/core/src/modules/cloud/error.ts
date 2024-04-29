export class NetworkError extends Error {
  constructor(public readonly originError: Error) {
    super(`Network error: ${originError.message}`);
    this.stack = originError.stack;
  }
}

export function isNetworkError(error: Error): error is NetworkError {
  return error instanceof NetworkError;
}

export class BackendError extends Error {
  constructor(public readonly originError: Error) {
    super(`Server error: ${originError.message}`);
    this.stack = originError.stack;
  }
}

export function isBackendError(error: Error): error is BackendError {
  return error instanceof BackendError;
}
