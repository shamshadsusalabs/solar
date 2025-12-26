// src/utils/logger.ts

/**
 * Development-only logger utility
 * Only logs when __DEV__ is true (React Native development mode)
 * No logs in production builds
 */

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const logger = {
    error: (...args: any[]) => {
        if (isDev) {
            console.error('[ERROR]', ...args);
        }
    },

    warn: (...args: any[]) => {
        if (isDev) {
            console.warn('[WARN]', ...args);
        }
    },

    info: (...args: any[]) => {
        if (isDev) {
            console.log('[INFO]', ...args);
        }
    },

    debug: (...args: any[]) => {
        if (isDev) {
            console.log('[DEBUG]', ...args);
        }
    },
};
