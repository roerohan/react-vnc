const fs = require("fs");
const pkg = require("./package.json");

// NOTE(roerohan): remove dependencies that are not needed for the library.
const {
	react,
	"react-dom": reactDom,
	"web-vitals": webVitals,
	...dependencies
} = pkg.dependencies;

const peerDependencies = {
	react: ">=19.0.0",
	"react-dom": ">=19.0.0",
};

fs.writeFileSync(
	"package.json",
	JSON.stringify(
		{
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
		},
		null,
		4,
	),
);
