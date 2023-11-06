import { app } from 'electron';
import { MainController } from './app/main-controller';

app.whenReady()
	.then(() => {
		const mainController = new MainController(app);
		mainController.bootstrap();
		mainController.createBackgroundController();
	})
	.catch(console.log);
