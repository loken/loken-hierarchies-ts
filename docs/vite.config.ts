import { defineDocConfig } from '@roenlie/mirage-docs';
import { UserConfig } from 'vite';


export default defineDocConfig({
	base:      '/',
	publicDir: 'docs/assets/',
	build:     {
		//emptyOutDir: false,
		outDir: './dist/preview',
	},
	plugins: [],
}, {
	cacheDir:   './docs',
	entryDir:   './src',
	autoImport: {
		tagPrefixes:   [ ],
		loadWhitelist: [ /\.ts/ ],
	},
}) as Promise<UserConfig>;
