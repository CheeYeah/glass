const esbuild = require('esbuild');
const path = require('path');

const baseConfig = {
    bundle: true,
    platform: 'neutral', // 修改为neutral平台以支持Node.js模块
    format: 'esm',
    loader: { '.js': 'jsx' },
    sourcemap: true,
    external: ['electron', ...Object.keys(process.binding('natives'))], // 排除所有Node.js内置模块
    define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`,
    },
    // 允许导入相对路径的模块
    resolveExtensions: ['.js', '.mjs', '.jsx'],
    logLevel: 'info',
};

const entryPoints = [
    { in: 'src/ui/app/HeaderController.js', out: 'public/build/header' },
    { in: 'src/ui/app/PickleGlassApp.js', out: 'public/build/content' },
    { in: 'src/ui/app/MainHeader.js', out: 'public/build/mainheader' },
    { in: 'src/ui/listen/stt/SttView.js', out: 'public/build/sttview' },
    { in: 'src/ui/listen/summary/SummaryView.js', out: 'public/build/summaryview' },
];

async function build() {
    try {
        console.log('Building renderer process code...');
        await Promise.all(entryPoints.map(point => esbuild.build({
            ...baseConfig,
            entryPoints: [point.in],
            outfile: `${point.out}.js`,
        })));
        console.log('✅ Renderer builds successful!');
    } catch (e) {
        console.error('Renderer build failed:', e);
        process.exit(1);
    }
}

async function watch() {
    try {
        const contexts = await Promise.all(entryPoints.map(point => esbuild.context({
            ...baseConfig,
            entryPoints: [point.in],
            outfile: `${point.out}.js`,
        })));
        
        console.log('Watching for changes...');
        await Promise.all(contexts.map(context => context.watch()));

    } catch (e) {
        console.error('Watch mode failed:', e);
        process.exit(1);
    }
}

if (process.argv.includes('--watch')) {
    watch();
} else {
    build();
} 