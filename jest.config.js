// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  roots: ['<rootDir>/src/'],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    '^.+\\.js$': 'babel-jest',
  },
}
