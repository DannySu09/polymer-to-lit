import ts from "typescript";
import { findGetAccessor, findReturnStatement } from "./utils";

function findPropertiesInClass(ast: ts.SourceFile): ts.GetAccessorDeclaration | undefined {
  let propertiesGetter: ts.GetAccessorDeclaration | undefined;

  ts.forEachChild(ast, (node) => {
    if (ts.isClassDeclaration(node)) {
      const propertiesAccessor = findGetAccessor(node, "properties");

      if (propertiesAccessor) {
        const returnStatement = findReturnStatement(propertiesAccessor);
        if (returnStatement?.expression) {
          if (ts.isObjectLiteralExpression(returnStatement.expression)) {

          }

          if (ts.isFunctionExpression(returnStatement.expression)) {

          }
        }
      }
    }
  });

  return propertiesGetter;
}

function collectPropertiesInfo(node: ts.ObjectLiteralExpression) {
  return node.properties.map(p => {
    return {
      name: p.name?.getText(),
    }
  })
}
