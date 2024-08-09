import ts from "typescript";

export function findGetAccessor(node: ts.ClassDeclaration, name: string) {
  for (const member of node.members) {
    if (ts.isGetAccessorDeclaration(member) &&
      member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword) &&
      ts.isIdentifier(member.name) &&
      member.name.text === name) {
      return member;
    }
  }
}

export function findReturnStatement(node: ts.GetAccessorDeclaration): ts.ReturnStatement | undefined {
    let returnStatement: ts.ReturnStatement | undefined;

    function visit(node: ts.Node) {
        if (ts.isReturnStatement(node)) {
            returnStatement = node;
            return;
        }
        ts.forEachChild(node, visit);
    }

    if (node.body && ts.isBlock(node.body)) {
        ts.forEachChild(node.body, visit);
    }

    return returnStatement;
}

