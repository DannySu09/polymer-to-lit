import ts from "typescript";

export function replacePolymerImportsWithLit (ast: ts.SourceFile): ts.SourceFile {
    const litImportStatements = getLitImportStatements(ast);

  // Remove import statements from the top of the code
  const updatedAst = ts.factory.updateSourceFile(
    ast,
    ast.statements.filter(statement => !ts.isImportDeclaration(statement)),
    ast.isDeclarationFile,
    ast.referencedFiles,
    ast.typeReferenceDirectives,
    ast.hasNoDefaultLib,
    ast.libReferenceDirectives
  );

  // Add the Lit import statements to the top of the file
  const updatedStatements = [
    ...litImportStatements,
    ...updatedAst.statements
  ];

  return ts.factory.updateSourceFile(
    updatedAst,
    updatedStatements,
    updatedAst.isDeclarationFile,
    updatedAst.referencedFiles,
    updatedAst.typeReferenceDirectives,
    updatedAst.hasNoDefaultLib,
    updatedAst.libReferenceDirectives
  );
}

function getLitImportStatements(ast: ts.SourceFile): ts.ImportDeclaration[] {
    let importStatements: ts.ImportDeclaration[] = [];

    ts.forEachChild(ast, (node) => {
      if (ts.isImportDeclaration(node)) {
        importStatements.push(node);
      }
    })

    // Filter out import statements that are importing "polymer"
    importStatements = importStatements.filter(importStmt => {
      const moduleSpecifier = importStmt.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        return !moduleSpecifier.text.includes('polymer');
      }
      return true;
    });

    // Add import statement for LitElement and html from 'lit'
    const litImport = ts.factory.createImportDeclaration(
        undefined,
        undefined,
        ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier('LitElement')
                ),
                ts.factory.createImportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier('html')
                )
            ])
        ),
        ts.factory.createStringLiteral('lit')
    );

    const litDecoratorImports = ts.factory.createImportDeclaration(
      undefined,
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('customElement')
          ),
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('property')
          ),
        ])
      ),
      ts.factory.createStringLiteral('lit/decorator')
    )

    // Add the new import statement to the beginning of the importStatements array
    importStatements.unshift(litDecoratorImports);
    importStatements.unshift(litImport);

    return importStatements;
}
