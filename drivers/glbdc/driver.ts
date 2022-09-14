import Homey from 'homey';

class MyDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    const discoveryStrategy = this.getDiscoveryStrategy();
    const discoveryResults = discoveryStrategy.getDiscoveryResults();

    console.log('discovery results', discoveryResults);

    const devices = Object.keys(discoveryResults).map(key => ({
      name: `Garo GLB ${discoveryResults[key].id.substring(12)}`,
      data: {
        id: discoveryResults[key].id,
      },
      store: {
        address: discoveryResults[key].address,
      },
    }));

    return devices;
  }

}

module.exports = MyDriver;
