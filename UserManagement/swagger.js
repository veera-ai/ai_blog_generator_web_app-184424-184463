const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Blog Generator API',
      version: '1.0.0',
      description: 'API for user authentication and AI-powered blog generation with history.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide JWT token as: Bearer <token>',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Healthcheck endpoints' },
      { name: 'Auth', description: 'User registration, login, and profile' },
      { name: 'Blogs', description: 'Blog generation and history' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
