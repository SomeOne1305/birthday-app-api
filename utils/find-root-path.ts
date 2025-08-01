import path from "path";
import fs from "fs";
export function findProjectRoot(startDir: string = __dirname): string {
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
