// NexaVPN - Application Constants

export const APP_NAME = 'NexaVPN';
export const APP_TAGLINE = 'نسل بعدی امنیت دیجیتال';
export const APP_TAGLINE_EN = 'Next Generation Digital Security';
export const APP_EMAIL = 'support@nexavpn.com';
export const APP_TELEGRAM = '@nexavpn';

// Session configuration
export const SESSION_COOKIE_NAME = 'nexa_sid';
export const SESSION_TTL_DAYS = 30;

// Invoice configuration
export const INVOICE_EXPIRY_MINUTES = 60;
export const RATE_LOCK_MINUTES = 30;

// Trial configuration
export const TRIAL = {
  ENABLED: process.env.ENABLE_FREE_TRIAL === 'true',
  DAYS: parseInt(process.env.FREE_TRIAL_DAYS || '3'),
  TRAFFIC_GB: parseInt(process.env.FREE_TRIAL_GB || '5'),
} as const;

// Retention policies (days)
export const RETENTION = {
  SESSIONS: 30,
  IDEMPOTENCY_KEYS: 90,
  TICKETS: 180,
  AUDIT_LOGS: 365,
  USER_USAGE: 90,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  LOGIN: 5,
  REGISTER: 3,
  TICKET_CREATE: 3,
  TICKET_MESSAGE: 10,
  INVOICE_CREATE: 5,
  WEBHOOK: 100,
} as const;

// Queue names
export const QUEUES = {
  NOTIFY: 'notify',
  PAYMENT_WATCH: 'payment_watch',
  PROVISION: 'provision',
  RETENTION_CLEANUP: 'retention_cleanup',
} as const;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

// Error codes
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Billing
  INVOICE_NOT_FOUND: 'INVOICE_NOT_FOUND',
  INVOICE_EXPIRED: 'INVOICE_EXPIRED',
  INVOICE_ALREADY_PAID: 'INVOICE_ALREADY_PAID',
  PAYMENT_NOT_DETECTED: 'PAYMENT_NOT_DETECTED',
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
  TRIAL_ALREADY_USED: 'TRIAL_ALREADY_USED',
  
  // VPN
  SERVER_NOT_FOUND: 'SERVER_NOT_FOUND',
  SERVER_OFFLINE: 'SERVER_OFFLINE',
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_EXPIRED: 'CONFIG_EXPIRED',
  
  // Tickets
  TICKET_NOT_FOUND: 'TICKET_NOT_FOUND',
  TICKET_CLOSED: 'TICKET_CLOSED',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  HIDDIFY_ERROR: 'HIDDIFY_ERROR',
} as const;

// Crypto payment configuration
export const CRYPTO = {
  USDT_ADDRESS: process.env.CRYPTO_USDT_ADDRESS || '',
  USDT_NETWORK: process.env.CRYPTO_USDT_NETWORK || 'TRC20',
  BTC_ADDRESS: process.env.CRYPTO_BTC_ADDRESS || '',
  BTC_NETWORK: process.env.CRYPTO_BTC_NETWORK || 'BTC',
  
  // Exchange rates (mock - should be fetched from API in production)
  RATES: {
    USDT: 1,
    BTC: 45000,
  },
} as const;

// Telegram configuration
export const TELEGRAM = {
  SUPPORT_CHAT_ID: process.env.TELEGRAM_SUPPORT_CHAT_ID || '',
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  CHANNEL: process.env.TELEGRAM_CHANNEL_USERNAME || '@nexavpn',
} as const;

// Hiddify configuration
export const HIDDIFY = {
  API_URL: process.env.HIDDIFY_API_URL || '',
  ADMIN_KEY: process.env.HIDDIFY_ADMIN_KEY || '',
  INBOUND_ID: parseInt(process.env.HIDDIFY_INBOUND_ID || '1'),
} as const;

// VPN Server configuration
export const VPN = {
  SERVER_DOMAIN: process.env.VPN_SERVER_DOMAIN || 'server.nexavpn.com',
  SERVER_PORT: parseInt(process.env.VPN_SERVER_PORT || '443'),
  PROTOCOL: process.env.VPN_PROTOCOL || 'vless',
} as const;

// Plan features (Persian)
export const PLAN_FEATURES = {
  UNLIMITED_TRAFFIC: 'ترافیک نامحدود',
  MULTI_DEVICE: 'چند دستگاه',
  SPEED: 'سرعت بالا',
  SUPPORT: 'پشتیبانی ۲۴/۷',
  NO_LOG: 'بدون لاگ',
  ENCRYPTION: 'رمزگذاری نظامی',
  LOCATIONS: 'سرورهای متنوع',
  STREAMING: 'پشتیبانی از استریم',
} as const;

// Server locations (for display)
export const SERVER_LOCATIONS = {
  DE: { name: 'آلمان', flag: '🇩🇪' },
  NL: { name: 'هلند', flag: '🇳🇱' },
  FI: { name: 'فنلاند', flag: '🇫🇮' },
  US: { name: 'آمریکا', flag: '🇺🇸' },
  UK: { name: 'انگلیس', flag: '🇬🇧' },
  CA: { name: 'کانادا', flag: '🇨🇦' },
  JP: { name: 'ژاپن', flag: '🇯🇵' },
  SG: { name: 'سنگاپور', flag: '🇸🇬' },
  TR: { name: 'ترکیه', flag: '🇹🇷' },
} as const;
