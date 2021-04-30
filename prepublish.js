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
	'react-scripts': reactScripts,
	'react-dom': '>=16.0.0',
};

fs.writeFileSync('./dist/package.json', JSON.stringify({
	name: pkg.name,
	description: pkg.description,
	version: pkg.version,
	repository: pkg.repository,
	keywords: pkg.keywords,
	main: pkg.main.replace(/dist\//ig, ''),
	typings: pkg.typings.replace(/dist\//ig, ''),
	publishConfig: pkg.publishConfig,
	dependencies,
	peerDependencies,
}, null, 4));
