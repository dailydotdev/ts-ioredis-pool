module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/*.spec.ts', '**/*.spec.ts'],
  rootDir: './',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  verbose: false,
}
