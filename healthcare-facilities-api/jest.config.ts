import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  rootDir: '.',
  testTimeout: 30000,
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageReporters: ['html', 'text-summary', 'lcov'],
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!<rootDir>/**/test/**',
    '!<rootDir>/**/index.ts',
    '!<rootDir>/**/tests/**',
    '!<rootDir>/**/events/**',
    '!<rootDir>/**/exceptions/**',
    '!<rootDir>/**/*.dto.ts',
    '!<rootDir>/**/*.interface.ts',
    '!<rootDir>/**/*.module.ts',
    '!<rootDir>/**/*.types.ts',
  ],
  modulePathIgnorePatterns: ['<rootDir>/../dist'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};
