// scripts/copy-index.ts
import fs from "fs";
import path from "path";
import { findProjectRoot } from "../utils/find-root-path";

const rootDir = findProjectRoot();

const srcPath = path.join(rootDir, "api", "index.cjs");
const destDir = path.join(rootDir, "public");
const destPath = path.join(destDir, "index.cjs");

// 1. Ensure public/ exists
if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true });
	console.log("📁 Created 'public' directory.");
}

// 2. Copy file
if (!fs.existsSync(srcPath)) {
	console.error("❌ Source file does not exist:", srcPath);
	process.exit(1);
}

fs.copyFileSync(srcPath, destPath);
console.log(`✅ Copied index.cjs → public/index.cjs`);
