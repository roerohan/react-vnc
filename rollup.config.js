import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: pkg.source,
    output: [
        { file: pkg.main, format: 'cjs' },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: true })],
    external: Object.keys(pkg.peerDependencies || {}),
};
