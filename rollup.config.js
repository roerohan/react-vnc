import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import fs from 'fs';

const {
	react,
	'react-scripts': reactScripts,
	'react-dom': reactDom,
	...dependencies
} = pkg.dependencies;

const peerDependencies = {
	react: '>=16.0.0',
	'react-scripts': reactScripts,
	'react-dom': '>=16.0.0',
};

fs.writeFileSync('./dist/package.json', JSON.stringify({
	name: pkg.name,
	description: pkg.description,
	version: pkg.version,
	private: false,
	main: pkg.main.replace(/dist\//ig, ''),
	typings: pkg.typings.replace(/dist\//ig, ''),
	publishConfig: pkg.publishConfig,
    keywords: pkg.keywords,
	dependencies,
	peerDependencies,
}, null, 4));

export default {
    input: pkg.source,
    output: [
        { file: pkg.main, format: 'cjs' },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: true })],
    external: Object.keys(pkg.peerDependencies || {}),
};
