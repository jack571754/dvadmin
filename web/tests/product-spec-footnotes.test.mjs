import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const transpile = (relativePath, requireModule = () => ({})) => {
	const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
	const compiled = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2020,
		},
	}).outputText;
	const moduleExports = {};
	new Function('exports', 'require', compiled)(moduleExports, requireModule);
	return moduleExports;
};

const productDisplay = transpile(
	'../src/views/design_order/product_spec/productDisplay.ts',
);
const productFootnotes = transpile(
	'../src/views/design_order/product_spec/productFootnotes.ts',
	(specifier) => {
		if (specifier === './productDisplay') return productDisplay;
		throw new Error(`Unexpected module: ${specifier}`);
	},
);

const sameNameProduct = {
	productCode: 'MAIN-001',
	nickname: '可预重组胶原蛋白韧养平滑身体霜',
	fullName: '可预重组胶原蛋白韧养平滑身体霜',
	spec: '100g/瓶/盒',
};
const registry = productFootnotes.createProductNumberRegistry([sameNameProduct]);
const numbered = registry.register(sameNameProduct);

assert.ok(numbered);
assert.equal(numbered.number, 1);
assert.equal(
	productFootnotes.formatProductFootnote(numbered),
	'[1]指可预重组胶原蛋白韧养平滑身体霜',
);

const missingFullName = registry.register({
	productCode: 'MAIN-002',
	nickname: '无备案全称商品',
	fullName: '',
	spec: '1盒',
});

assert.ok(missingFullName);
assert.equal(missingFullName.fullName, '');
assert.equal(productFootnotes.formatProductFootnote(missingFullName), undefined);

console.log('product-spec footnote formatting passed');
