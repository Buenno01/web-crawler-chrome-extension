export default {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    "**/__tests__/**/*.spec.js",
    "**/__tests__/**/*.test.js"
  ],
  globals: {
    chrome: {}
  }
}; 