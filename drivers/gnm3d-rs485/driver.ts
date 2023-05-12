import Homey from 'homey';
import fetch from 'http.min';
import { ExternalMeterStatus } from '../../types/external-meter-status';
import { meterInfoUrl } from './device-const';

class MyDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('GNM3D-RS485 has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    console.log("Pairing started");
    return [];
  }

  async onPair(session: any) {
    await session.showView("configure_ip");

    session.setHandler("configure_ip", async (data: any) => {
      this.log('backend configure_ip, ip: ', data.settings.host);

      let result: { data: ExternalMeterStatus };
      try {
        const options = {
          timeout: 4000,
          json: true,
          protocol: 'http:',
          hostname: data.settings.host,
          port: 8080,
          path: `/${meterInfoUrl}${(new Date()).getTime()}`,
          headers: {
            'User-Agent': 'Homey'
          }
        };
        result = await fetch(options);
      } catch (e: any) {
        this.error('No response from a Garo charger on this IP address', e.message);
        throw new Error('No response from a Garo charger on this IP address');
      }

      this.log('result.data', result.data);
      if (!result?.data?.meterSerial) {
        throw new Error('The device on this IP address does not appear to be a Garo smart meter.');
      }
      return {
        ...data,
        data: {
          id: result.data.meterSerial,
        }
      };
    });

    // Received when a view has changed
    session.setHandler("showView", async function (viewId: string) {
      console.log("View: " + viewId);
    });
  }
}

module.exports = MyDriver;
