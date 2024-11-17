import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    '^middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@App/(.*)$': '<rootDir>/src/$1',
    '^web/(.*)$': '<rootDir>/src/web/$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
};

export default config;
