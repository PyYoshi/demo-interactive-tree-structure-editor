module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // ユニットテスト + パフォーマンステストの両方を対象
  testMatch: [
    '**/__tests__/performance/**/*.perf.test.{ts,tsx}',  // パフォーマンステスト
    '**/src/**/*.test.{ts,tsx}'  // ユニットテスト
  ],

  // TypeScript と JSX のトランスパイル
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx', // React 17+の自動JSX変換
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // モジュール解決
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  // カバレッジ設定（パフォーマンステストではカバレッジ不要）
  collectCoverage: false,

  // モジュール拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
