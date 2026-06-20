/**
 * Simple Logger untuk mempermudah debungging dan tracing request.
 */

export const logger = {
  info: (message: string, data?: any) => {
    if (data !== undefined) {
      console.log(`%c[INFO]%c ${message}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;', data);
    } else {
      console.log(`%c[INFO]%c ${message}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;');
    }
  },
  warn: (message: string, data?: any) => {
    if (data !== undefined) {
      console.warn(`%c[WARN]%c ${message}`, 'color: #f59e0b; font-weight: bold;', 'color: inherit;', data);
    } else {
      console.warn(`%c[WARN]%c ${message}`, 'color: #f59e0b; font-weight: bold;', 'color: inherit;');
    }
  },
  error: (message: string, error?: any) => {
    if (error !== undefined) {
      console.error(`%c[ERROR]%c ${message}`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', error);
    } else {
      console.error(`%c[ERROR]%c ${message}`, 'color: #ef4444; font-weight: bold;', 'color: inherit;');
    }
  },
  success: (message: string, data?: any) => {
    if (data !== undefined) {
      console.log(`%c[SUCCESS]%c ${message}`, 'color: #10b981; font-weight: bold;', 'color: inherit;', data);
    } else {
      console.log(`%c[SUCCESS]%c ${message}`, 'color: #10b981; font-weight: bold;', 'color: inherit;');
    }
  }
};
