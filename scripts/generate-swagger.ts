import fs from "fs";
import { swaggerSpec } from "../app/swagger";
import path from "path";
import { findProjectRoot } from "../utils/find-root-path";



const rootDir = findProjectRoot();
const publicDir = path.join(rootDir, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log("📁 Created 'public' directory at:", publicDir);
}

fs.writeFileSync(
  path.join(publicDir, "swagger.json"),
  JSON.stringify(swaggerSpec, null, 2)
);
console.log('swagger.json is created successfully inside the public directory ✅')