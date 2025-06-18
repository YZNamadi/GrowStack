import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GrowStack API Documentation',
      version: '1.0.0',
      description: 'API documentation for GrowStack - Backend-as-a-service for African fintech companies',
      contact: {
        name: 'API Support',
        email: 'support@growstack.com'
      }
    },
    servers: [
      {
        url: 'https://growstack.onrender.com/api/v1',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
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
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 