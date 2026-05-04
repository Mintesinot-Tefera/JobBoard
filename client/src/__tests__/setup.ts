import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock import.meta.env
vi.stubEnv('VITE_API_URL', 'http://localhost:4000/api');
