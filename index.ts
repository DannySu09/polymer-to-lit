import * as ts from 'typescript';

function findClassInAST(node: ts.Node): ts.ClassDeclaration | undefined {
    if (ts.isClassDeclaration(node)) {
        return node;
    }

    let foundClass: ts.ClassDeclaration | undefined;

    ts.forEachChild(node, child => {
        if (!foundClass) {
            foundClass = findClassInAST(child);
        }
    });

    return foundClass;
}

function findPropertiesInClass(classNode: ts.ClassDeclaration): ts.Node | undefined {
    for (const member of classNode.members) {
        if (ts.isPropertyDeclaration(member) &&
            ts.isIdentifier(member.name) &&
            member.name.text === 'properties') {

            if (member.initializer && ts.isObjectLiteralExpression(member.initializer)) {
                return member.initializer;
            }
        }
    }
    return undefined;
}

function transformPropertyToClassMember(propertiesNode: ts.ObjectLiteralExpression): ts.ClassElement[] {
    const newMembers: ts.ClassElement[] = [];

    for (const property of propertiesNode.properties) {
        if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
            const propertyName = property.name.text;
            const propertyValue = property.initializer;

            if (ts.isObjectLiteralExpression(propertyValue)) {
                let type: ts.Expression | undefined;
                let value: ts.Expression | undefined;

                for (const prop of propertyValue.properties) {
                    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                        if (prop.name.text === 'type') {
                            type = prop.initializer;
                        } else if (prop.name.text === 'value') {
                            value = prop.initializer;
                        }
                    }
                }

                if (type) {
                    const decorator = ts.factory.createDecorator(
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier('property'),
                            undefined,
                            [ts.factory.createObjectLiteralExpression([
                                ts.factory.createPropertyAssignment('type', type)
                            ])]
                        )
                    );

                    const newProperty = ts.factory.createPropertyDeclaration(
                        [decorator],
                        propertyName,
                        undefined,
                        undefined,
                        value
                    );

                    newMembers.push(newProperty);
                }
            }
        }
    }

    return newMembers;
}

function transformClassProperties(sourceFile: ts.SourceFile): ts.SourceFile {
    function visit(node: ts.Node): ts.Node {
        if (ts.isClassDeclaration(node)) {
            const propertiesNode = findPropertiesInClass(node);
            if (propertiesNode && ts.isObjectLiteralExpression(propertiesNode)) {
                const newMembers = transformPropertyToClassMember(propertiesNode);
                return ts.factory.updateClassDeclaration(
                    node,
                    node.modifiers,
                    node.name,
                    node.typeParameters,
                    node.heritageClauses,
                    [...node.members, ...newMembers]
                );
            }
        }
        return ts.visitEachChild(node, visit);
    }

    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
}




function transformToAST(code: string): ts.Node {
  // Create a source file
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );

  // Return the AST
  return sourceFile;
}
