import fs from "node:fs";
import ts from 'typescript';

function extractTemplateLiteralContent(node: ts.GetAccessorDeclaration): string | undefined {
    if (node.body) {
        for (const statement of node.body.statements) {
            if (ts.isReturnStatement(statement)) {
                const returnExpression = statement.expression;
                if (returnExpression && ts.isTemplateExpression(returnExpression)) {
                    return returnExpression.head.text + returnExpression.templateSpans
                        .map(span => `${span.expression.getText()}${span.literal.text}`)
                        .join('');
                }
            }
        }
    }
}

function extractPropertiesContent(node: ts.GetAccessorDeclaration): ts.Node {
    if (node.body) {
        for(const statement of node.body.statements) {
            if (ts.isReturnStatement(statement)) {
                const returnExpression = statement.expression;

                if (returnExpression && ts.isObjectLiteralExpression(returnExpression)) {
                    return returnExpression;
                }
            }
        }
    }
}

function deletePropertyFromClass(node: ts.ClassDeclaration, propertyNameToDelete: string): ts.ClassDeclaration {
    const updatedMembers = node.members.filter(member => {
        if (ts.isPropertyDeclaration(member) && ts.isIdentifier(member.name)) {
            return member.name.text !== propertyNameToDelete;
        }
        return true;
    });

    return ts.factory.updateClassDeclaration(
        node,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        updatedMembers
    );
}

function transformASTToCode(node: ts.Node): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const resultFile = ts.createSourceFile(
        "output.ts",
        "",
        ts.ScriptTarget.Latest,
        false,
        ts.ScriptKind.TS
    );
    return printer.printNode(ts.EmitHint.Unspecified, node, resultFile);
}


export function transform(filePath: string) {
    const code = fs.readFileSync(filePath, { encoding: "utf8" });
    // Create a source file
    const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true
    );

    ts.forEachChild(sourceFile, node => {
        if (ts.isClassDeclaration(node)) {
            for (const member of node.members) {
                if (ts.isGetAccessorDeclaration(member)) {
                    const memberName = member.name?.getText();
                    if (memberName === "template") {
                        const templateText = extractTemplateLiteralContent(member);
                    } else if (memberName === "properties") {

                    }
                } else if (ts.isPropertyDeclaration(member) &&
                    ts.isIdentifier(member.name) &&
                    member.name.text === 'properties') {

                    if (member.initializer && ts.isObjectLiteralExpression(member.initializer)) {
                        return member.initializer;
                    }
                }
            }
        }
    });

    const transformedCode = transformASTToCode(sourceFile);
    const litFilePath = filePath.replace(".ts", ".lit.ts");

    fs.writeFileSync(litFilePath, transformedCode);
}

