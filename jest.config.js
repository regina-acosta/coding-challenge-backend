const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  injectGlobals: false,
  roots: ["<rootDir>"],
  testPathIgnorePatterns: ["<rootDir>/node_modules", "<rootDir>/dist"],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}),
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],
  transform: {
    "\\.tsx?$": ["ts-jest", { isolatedModules: true }],
  },
};
