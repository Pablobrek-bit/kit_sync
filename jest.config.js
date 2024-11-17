// eslint-disable-next-line no-undef
module.exports = {
  clearMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  basePath: 'src',
  moduleNameMapper: {
    '^middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@App/(.*)$': '<rootDir>/src/$1',
    '^web/(.*)$': '<rootDir>/src/web/$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
};
