const swaggerUi = require('swagger-ui-express');

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Multi-tenant RBAC API',
    version: '1.0.0',
    description: 'API documentation for multi-tenant RBAC backend'
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local dev server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Login with email and static password "123"',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' }
        }
      }
    }
  }
};

module.exports = { swaggerUi, swaggerSpec };
