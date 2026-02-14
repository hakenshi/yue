// Test setup file
// This file is loaded before running tests

// Setup test environment
process.env.NODE_ENV = "test";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy_key_for_testing";
process.env.DATABASE_URL = "postgres://yue:yue@localhost:5432/yue";
