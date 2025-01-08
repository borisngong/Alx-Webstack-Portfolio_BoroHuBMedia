const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../docs/swagger.json");
/**
 * Configures and sets up the swagger documentation
 * @param {*} app  The express app
 */
const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
