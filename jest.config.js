/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: '@happy-dom/jest-environment',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
    '<rootDir>/src/tests/**/*.test.ts'
  ],
  moduleNameMapper: {
    '^@/lib/supabase$': '<rootDir>/src/tests/__mocks__/@/lib/supabase.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@supabase/supabase-js$': '<rootDir>/src/tests/__mocks__/supabase.ts'
  },
  setupFiles: ['<rootDir>/src/tests/setup-mocks.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/**/*.test.{ts,tsx}'
  ],
  coverageReporters: ['text'],
  verbose: true,
  testTimeout: 30000,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { 
      useESM: true,
      tsconfig: {
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@astrojs|astro)/)'
  ],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/.astro/'
  ]
};