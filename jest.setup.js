// Add custom jest matchers for DOM elements
require('@testing-library/jest-dom');
const { chrome } = require('jest-chrome');

// Mock the chrome API
global.chrome = chrome; 