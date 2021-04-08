import pkg from './package.json';
import typescript from '@rollup/plugin-typescript';

export default {
    input: pkg.source,
    output: [
        { file: pkg.main, format: 'cjs' },
        { file: pkg.module, format: 'esm' }
    ],
    plugins: [typescript({ target: "es5" })],
    external: Object.keys(pkg.peerDependencies || {}),
};
