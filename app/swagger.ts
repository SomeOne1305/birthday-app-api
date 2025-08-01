import {static as static_} from 'express'
import path from 'path'
import type { Express } from "express";
// src/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { findProjectRoot } from "../utils/find-root-path";

const swaggerOptions: swaggerJSDoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Birthmark API",
			version: "1.0.0",
			description: "API documentation using swagger for Birthmark API",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT", // optional, for UI clarity
				},
			},
		},
	},
	apis: ["./app/routes/**/*.ts"], // 👈 Path to your route files
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express) {
	const rootPath = findProjectRoot()

	if(process.env.VERCEL_URL && process.env.VERCEL_URL.includes('vercel.app')){
		app.use('/docs', static_(path.join(rootPath, 'public/docs')))
	}else{
		app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	}
}
