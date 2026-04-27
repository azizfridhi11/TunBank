import { z } from 'zod';
import { insertUserSchema, insertAccountSchema, insertTransactionSchema, insertCardSchema, users, accounts, transactions, cards } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  accounts: {
    list: {
      method: 'GET' as const,
      path: '/api/accounts' as const,
      responses: {
        200: z.array(z.custom<typeof accounts.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/accounts' as const,
      input: insertAccountSchema,
      responses: {
        201: z.custom<typeof accounts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/accounts/:id' as const,
      responses: {
        200: z.custom<typeof accounts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions' as const, // For admin or all user transactions
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions' as const,
      input: insertTransactionSchema.extend({
        amount: z.coerce.number(), // Coerce for form handling
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  cards: {
    list: {
      method: 'GET' as const,
      path: '/api/cards' as const,
      responses: {
        200: z.array(z.custom<typeof cards.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cards' as const,
      input: insertCardSchema,
      responses: {
        201: z.custom<typeof cards.$inferSelect>(),
      },
    },
  },
  loans: {
    list: {
      method: 'GET' as const,
      path: '/api/loans' as const,
      responses: {
        200: z.array(z.custom<any>()), // Replace with proper type in next step
      },
    },
    apply: {
      method: 'POST' as const,
      path: '/api/loans' as const,
      input: z.object({
        type: z.enum(["personal", "mortgage", "auto", "education", "business", "micro"]),
        amount: z.coerce.number().positive(),
        durationMonths: z.coerce.number().int().positive(),
        accountId: z.coerce.number().int().positive(),
      }),
      responses: {
        200: z.custom<any>(),
        400: errorSchemas.validation,
      },
    },
    repay: {
      method: 'POST' as const,
      path: '/api/loans/:id/repay' as const,
      input: z.object({
        amount: z.coerce.number(),
        accountId: z.coerce.number(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), newBalance: z.string() }),
        400: errorSchemas.validation,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
