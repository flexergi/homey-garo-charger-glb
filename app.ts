import Homey from 'homey';

class GaroApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('Garo EV charger and meter app has been initialized');
  }
}

module.exports = GaroApp;
