// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js'],
  roots: ['<rootDir>/src/js'],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
}
