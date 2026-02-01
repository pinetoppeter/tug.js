import { beforeEach, vi } from 'vitest';

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  cb(0);
  return 0;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});