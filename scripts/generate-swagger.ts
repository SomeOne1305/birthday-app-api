import fs from "fs";
import { swaggerSpec } from "../app/swagger";
import path from "path";

function findProjectRoot(startDir: string = __dirname): string {
  let currentDir = startDir;

  while (true) {
    const pkgPath = path.join(currentDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(
        "🚫 package.json not found - not inside a Node.js project?"
      );
    }
    currentDir = parentDir;
  }
}

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
