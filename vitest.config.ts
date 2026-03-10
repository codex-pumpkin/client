import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      include: ["src/**"],
      exclude: [
        "src/app/model/_test_common/**",
        "src/main.ts",
        "src/app/model/network/dtos/**",
        "src/app/vvm/circuit-graph/**"
      ]
    },
  },
});
