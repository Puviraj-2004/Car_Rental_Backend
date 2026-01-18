import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const isProduction = process.env.NODE_ENV === 'production';

const createStore = () => {
  if (isProduction && process.env.REDIS_HOST) {
    try {
      return new RedisStore({
        // @ts-ignore
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelay: 500,
        maxRetries: 3
      });
    } catch (error) {
      return undefined;
    }
  }
  return undefined; 
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isProduction ? 100 : 500, 
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '900' 
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  store: createStore(),
  validate: false, 
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isProduction ? 5 : 10, 
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '900'
  },
  standardHeaders: true,
  store: createStore(),
  validate: false,
  skip: (_req, res) => {
    return res.statusCode === 200;
  },
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: isProduction ? 3 : 5, 
  message: {
    error: 'Too many password reset requests, please try again later.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    retryAfter: '3600'
  },
  standardHeaders: true,
  store: createStore(),
  validate: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: isProduction ? 5 : 10, 
  message: {
    error: 'Too many registration attempts from this IP, please try again later.',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    retryAfter: '3600'
  },
  standardHeaders: true,
  store: createStore(),
  validate: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: isProduction ? 20 : 50, 
  message: {
    error: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: '3600'
  },
  standardHeaders: true,
  store: createStore(),
  validate: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isProduction ? 50 : 100, 
  message: {
    error: 'Too many admin operations, please try again later.',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED',
    retryAfter: '900'
  },
  standardHeaders: true,
  store: createStore(),
  validate: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
});