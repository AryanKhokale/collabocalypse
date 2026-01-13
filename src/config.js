// Frontend environment and constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Test/Demo Constants (Add these to test without Keycloak)
export const TEST_EMAIL = 'testuser@example.com';
export const TEST_DOC_ID = 'doc_12345';

// Keycloak Configuration (Optional)
export const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:9000',
  // Default to imported realm/client from full-config.json
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'Myapp',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'quill-client',
};
