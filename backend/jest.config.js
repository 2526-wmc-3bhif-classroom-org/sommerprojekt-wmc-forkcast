/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/test/**/*.test.ts"],
  moduleNameMapper: {
    // This is important for resolving modules correctly, especially with 'type: "module"'
    // Adjust paths if your project structure is different
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // Use ts-jest for TypeScript files
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true, // Enable ES Modules support
    }],
  },
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ES Modules
};
