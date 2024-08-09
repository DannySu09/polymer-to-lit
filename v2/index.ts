import fs from "node:fs";
import ts from "typescript";

import { replacePolymerImportsWithLit } from "./replace-imports";

function transform(filePath: string) {
  const codeText = fs.readFileSync(filePath, { encoding: "utf-8" });
  let ast = ts.createSourceFile(
      filePath,
      codeText,
      ts.ScriptTarget.Latest,
      true
  );

  ast = replacePolymerImportsWithLit(ast);
}
