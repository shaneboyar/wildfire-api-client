/* eslint-disable @typescript-eslint/no-explicit-any */
class CliConsole {
  private verbose = false;

  setVerbose(value: boolean) {
    this.verbose = value;
  }

  log(...args: any[]) {
    if (this.verbose) {
      console.log(...args);
    }
  }

  debug(...args: any[]) {
    if (this.verbose) {
      console.debug(...args);
    }
  }

  info(...args: any[]) {
    console.info(...args);
  }

  error(...args: any[]) {
    console.error(...args);
  }

  async withSuppressedLogs<T>(fn: () => Promise<T>): Promise<T> {
    const originalLog = console.log;
    if (!this.verbose) {
      console.log = () => {};
    }
    try {
      return await fn();
    } finally {
      console.log = originalLog;
    }
  }
}

export const cliConsole = new CliConsole();
