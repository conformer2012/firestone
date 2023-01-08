import { Injectable } from '@angular/core';
import { Preferences } from '@legacy-import/src/lib/js/models/preferences';
import { GameStatusService } from '@legacy-import/src/lib/js/services/game-status.service';
import { OverwolfService } from '@legacy-import/src/lib/js/services/overwolf.service';
import { OwUtilsService } from '@legacy-import/src/lib/js/services/plugins/ow-utils.service';
import { PreferencesService } from '@legacy-import/src/lib/js/services/preferences.service';

const MELON_LOADER_LATESTT_ZIP = 'https://github.com/LavaGang/MelonLoader/releases/download/v0.5.7/MelonLoader.x86.zip';

@Injectable()
export class ModsUtilsService {
	constructor(
		private readonly ow: OverwolfService,
		private readonly io: OwUtilsService,
		private readonly gameStatus: GameStatusService,
		private readonly prefs: PreferencesService,
	) {}

	public async checkMods(installPath: string): Promise<'wrong-path' | 'installed' | 'not-installed'> {
		const files = await this.ow.listFilesInDirectory(installPath);
		if (!files.data?.some((f) => f.type === 'file' && f.name === 'Hearthstone.exe')) {
			console.warn('Not a Hearthstone directory, missing Hearthstone.exe', installPath);
			return 'wrong-path';
		}
		await this.updateInstallPath(installPath);
		console.debug('files in HS dir', files);
		const modsEnabled =
			files.data?.some((f) => f.type === 'dir' && f.name === 'MelonLoader') ||
			files.data?.some((f) => f.type === 'file' && f.name === 'version.dll');
		console.debug('mods enabled?', modsEnabled);
		return modsEnabled ? 'installed' : 'not-installed';
	}

	public async installedMods(installPath: string): Promise<readonly string[]> {
		const files = await this.ow.listFilesInDirectory(`${installPath}\\Mods`);
		console.debug('looking for installed mods', files);
		return files.data
			?.filter((f) => f.type === 'file')
			.map((f) => f.name.split('.dll')[0])
			.filter((name) => name !== 'GameEventsConnector');
	}

	public async enableMods(
		installPath: string,
	): Promise<'game-running' | 'wrong-path' | 'installed' | 'not-installed'> {
		const isGameRunning = await this.gameStatus.inGame();
		if (isGameRunning) {
			console.warn('Please close the game before disabling mods');
			return 'game-running';
		}
		if (!installPath?.includes('Hearthstone')) {
			console.warn('Trying to install a path that does not contain Hearthstone, too risky', installPath);
			return 'wrong-path';
		}
		const modsEnabled = await this.checkMods(installPath);
		if (modsEnabled === 'installed') {
			console.warn('Trying to enable mods but they are already enabled', installPath);
			return 'installed';
		}
		await this.io.downloadAndUnzipFile(MELON_LOADER_LATESTT_ZIP, installPath);
		await this.createMelonConfig(installPath);
		// await this.installBaseMods(installPath);

		// Copy the Managed libs
		return await this.refreshEngine(installPath);
	}

	// Copy the managed libs
	public async refreshEngine(
		installPath: string,
	): Promise<'game-running' | 'wrong-path' | 'installed' | 'not-installed'> {
		const isGameRunning = await this.gameStatus.inGame();
		if (isGameRunning) {
			console.warn('Please close the game before disabling mods');
			return 'game-running';
		}
		if (!installPath?.includes('Hearthstone')) {
			console.warn('Trying to install a path that does not contain Hearthstone, too risky', installPath);
			return 'wrong-path';
		}
		const modsEnabled = await this.checkMods(installPath);
		if (modsEnabled !== 'installed') {
			console.warn('Cannot refresh if mods are not enabled', installPath);
			return 'not-installed';
		}
		await this.io.copyFiles(`${installPath}\\MelonLoader\\Managed`, `${installPath}\\Hearthstone_Data\\Managed`);
		return 'installed';
	}

	public async disableMods(
		installPath: string,
		keepData: boolean = true,
	): Promise<'game-running' | 'wrong-path' | 'installed' | 'not-installed'> {
		const isGameRunning = await this.gameStatus.inGame();
		if (isGameRunning) {
			console.warn('Please close the game before disabling mods');
			return 'game-running';
		}
		if (!installPath?.includes('Hearthstone')) {
			console.warn('Trying to delete inside a path that does not contain Hearthstone, too risky', installPath);
			return 'wrong-path';
		}
		const modsEnabled = await this.checkMods(installPath);
		if (!modsEnabled) {
			console.warn('Trying to disable mods but they are not enabled', installPath);
			return 'not-installed';
		}
		await this.io.deleteFileOrFolder(`${installPath}\\version.dll`);
		await this.io.deleteFileOrFolder(`${installPath}\\MelonLoader`);
		if (!keepData) {
			await this.io.deleteFileOrFolder(`${installPath}\\Plugins`);
			await this.io.deleteFileOrFolder(`${installPath}\\Mods`);
			await this.io.deleteFileOrFolder(`${installPath}\\UserData`);
		}
		return 'not-installed';
	}

	private async updateInstallPath(installPath: string) {
		const prefs = await this.prefs.getPreferences();
		const newPrefs: Preferences = { ...prefs, gameInstallPath: installPath };
		await this.prefs.savePreferences(newPrefs);
	}

	private async createMelonConfig(installPath: string) {
		this.ow.writeFileContents(
			`${installPath}\\UserData\\MelonStartScreen\\Config.cfg`,
			`
	[General]
	# Toggles the Entire Start Screen  ( true | false )
	Enabled = false
	# Current Theme of the Start Screen
	Theme = "Default"
		`,
		);
	}
}