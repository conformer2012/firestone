import { app } from 'electron';
import { rendererAppName, rendererAppPort } from './app/constants';
import { MainController } from './app/main-controller';

app.whenReady()
	.then(() => {
		const mainController = new MainController(app);
		mainController.bootstrap();
		mainController.createBackgroundController(rendererAppName, rendererAppPort);
	})
	.catch(console.log);
