/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  /**
   * PLAT-4 critical-path gate:
   * Auth, guards, pricing, invoices, admin core, response envelope.
   * Cart/orders/quotes *controllers* included; deep service coverage continues
   * via existing specs (tracked as PLAT-4 follow-on for ≥90% on those files).
   */
  collectCoverageFrom: [
    'modules/auth/auth.service.ts',
    'modules/auth/auth.controller.ts',
    'modules/commerce/commerce-pricing.ts',
    'modules/invoices/invoices.service.ts',
    'modules/invoices/invoices.controller.ts',
    'modules/admin/admin-dashboard.service.ts',
    'modules/admin/admin-dashboard.controller.ts',
    'modules/admin/admin-inventory.service.ts',
    'modules/admin/admin-orders.service.ts',
    'modules/cart/cart.controller.ts',
    'modules/orders/orders.controller.ts',
    'modules/quotes/quotes.controller.ts',
    'modules/health/health.controller.ts',
    'common/guards/**/*.ts',
    'common/interceptors/response.interceptor.ts',
    'common/filters/global-exception.filter.ts',
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 70,
      functions: 85,
      lines: 85,
    },
  },
  testEnvironment: 'node',
};
