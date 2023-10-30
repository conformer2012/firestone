import fs from 'fs-extra';

const copyAssets = async () => {
	const sourcePath = 'overwolf';
	const outputPath = 'dist/apps/legacy/';
	console.log(`[copy-assets] preparing to copy assets from ${sourcePath} to ${outputPath}`);

	fs.copy(sourcePath, outputPath)
		.then(() => {
			console.log('[copy-assets] Assets copied successfully.');
		})
		.catch((err) => {
			console.error('[copy-assets] Error copying assets:', err);
		});
};

copyAssets();
