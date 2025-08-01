"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// app/swagger.ts
var swagger_exports = {};
__export(swagger_exports, {
  setupSwagger: () => setupSwagger,
  swaggerSpec: () => swaggerSpec
});
module.exports = __toCommonJS(swagger_exports);
var import_swagger_jsdoc = __toESM(require("swagger-jsdoc"));
var import_swagger_ui_express = __toESM(require("swagger-ui-express"));
var swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Birthmark API",
      version: "1.0.0",
      description: "API documentation using swagger for Birthmark API"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
          // optional, for UI clarity
        }
      }
    }
  },
  apis: ["./app/routes/**/*.ts"]
  // 👈 Path to your route files
};
var swaggerSpec = (0, import_swagger_jsdoc.default)(swaggerOptions);
function setupSwagger(app) {
  app.use("/docs", import_swagger_ui_express.default.serve, import_swagger_ui_express.default.setup(swaggerSpec));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setupSwagger,
  swaggerSpec
});
