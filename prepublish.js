const fs = require('fs');
const pkg = require('./package.json');

const {
	react,
	'react-scripts': reactScripts,
	'react-dom': reactDom,
	...dependencies
} = pkg.dependencies;

const peerDependencies = {
	react: '>=16.0.0',
	'react-scripts': '>=4.0.0',
	'react-dom': '>=16.0.0',
};

fs.writeFileSync('package.json', JSON.stringify({
	name: pkg.name,
	description: pkg.description,
	version: pkg.version,
	repository: pkg.repository,
	keywords: pkg.keywords,
	main: pkg.main,
	module: pkg.module,
	exports: pkg.exports,
	typings: pkg.typings,
	publishConfig: pkg.publishConfig,
	dependencies,
	peerDependencies,
}, null, 4));
