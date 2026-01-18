const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fitness Booking API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    tags: [
      {
        name: "Users",
        description: "API for users",
      },
      {
        name: "Bookings",
        description: "API for bookings",
      },
      {
        name: "Fitness Classes",
        description: "API for fitness classes",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter the token from the login endpoint in the format: Bearer <token>",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // ที่เขียน swagger comment
};

module.exports = swaggerJSDoc(options);

