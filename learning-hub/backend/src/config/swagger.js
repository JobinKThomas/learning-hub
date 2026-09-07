import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Learning Hub API',
      version: '1.0.0',
      description: 'API documentation for the Learning Hub platform (Phase 1 Authentication & Phase 0 Foundation)',
      contact: {
        name: 'Learning Hub Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Bearer access token to authorize requests',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message description' },
            errors: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66dc4b5f884a1e4922e96410' },
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            role: { type: 'string', enum: ['student', 'instructor', 'admin'], example: 'student' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
