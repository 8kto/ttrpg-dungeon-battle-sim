// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js'],
  resolver: '<rootDir>/jest.custom-resolver.js',
  roots: ['<rootDir>/src/js'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
}
