import pkg from "./package.json" with { type: "json" };
import typescript from "@rollup/plugin-typescript";

const config = {
    input: pkg.source,
    output: [
        { file: pkg.main, format: "cjs" },
        { file: pkg.module, format: "es" },
    ],
    plugins: [typescript()],
    external: Object.keys(pkg.peerDependencies ?? {}),
};

export default config;
