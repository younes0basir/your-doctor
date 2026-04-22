// Auto-detect if running in production (deployed)
const isProduction = import.meta.env.MODE === 'production' || window.location.hostname !== 'localhost';

// Use relative path in production, localhost in development
const rawApiUrl = import.meta.env.VITE_API_URL || (isProduction ? '' : 'http://localhost:5000');

export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
