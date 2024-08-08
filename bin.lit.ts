import process from "node:process";
import path from "node:path";
import { transform } from "./index";
const args = process.argv.slice(2);
const cwd = process.cwd();
const fileList = args.map(filePath => path.resolve(cwd, filePath));
for (const filePath of fileList) {
    transform(filePath);
}
