import ts from 'typescript';
import { isDefaultImport } from '../../ast-helpers.js';
import { importVisitor as visit } from '../index.js';

export default visit(
  () => true,
  (node, options) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      if (!node.importClause) {
        // Pattern: import 'side-effects';
        return { specifier };
      } else {
        if (node.importClause.isTypeOnly && options.skipTypeOnly) return;

        const imports = [];

        if (isDefaultImport(node)) {
          // Pattern: import identifier from 'specifier'
          imports.push({ specifier, identifier: 'default', pos: node.moduleSpecifier.pos });
        }

        if (node.importClause?.namedBindings) {
          if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            // Pattern: import * as NS from 'specifier'
            // @ts-expect-error TODO FIXME Property 'symbol' does not exist on type 'NamespaceImport'.
            const symbol = node.importClause.namedBindings.symbol;
            imports.push({ symbol, specifier, identifier: '*', pos: symbol?.declarations[0]?.pos ?? node.pos });
          }
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            // Pattern: import { identifier as NS } from 'specifier'
            node.importClause.namedBindings.elements.forEach(element => {
              const identifier = (element.propertyName ?? element.name).getText();
              // @ts-expect-error TODO FIXME Property 'symbol' does not exist on type 'ImportSpecifier'.
              imports.push({ symbol: element.symbol, specifier, identifier, pos: element.pos });
            });
          }
        }

        return imports;
      }
    }
  }
);
