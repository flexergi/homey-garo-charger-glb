import Homey from 'homey';
import fetch from 'http.min';
import { Status } from '../../types';
import { statusUrl } from './device-const';

class ChargerDriver extends Homey.Driver {
  flowCards: Record<string, Homey.FlowCardCondition | Homey.FlowCardAction | Homey.FlowCardTriggerDevice> = {};
  flowCardListeners: Record<string, Homey.FlowCard> = {};

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('ChargerDriver has been initialized');
    this.flowCards;
    this.registerFlows();
  }

  registerFlows() {
    this.log('Registering flows');

    // Triggers
    this.flowCards.connectorChanged = this.homey.flow.getDeviceTriggerCard('connectorChanged');
    this.flowCards.modeChanged = this.homey.flow.getDeviceTriggerCard('modeChanged');

    // Conditions
    this.flowCards.connectorStatus = this.homey.flow.getConditionCard('connectorStatus');
    this.flowCardListeners.connectorStatus = this.flowCards.connectorStatus.registerRunListener(async (args, state) => {
      this.log(`[${args.device.getName()}] Condition 'connectorStatus' triggered`);
      let connector = args.device.getCapabilityValue('connector');
      this.log(`[${args.device.getName()}] - current status: ${connector}, condition status: '${args.connector}`);
      return connector === args.connector;
    });

    this.flowCards.mode = this.homey.flow.getConditionCard('mode');
    this.flowCardListeners.flowCards = this.flowCards.mode.registerRunListener(async (args, state) => {
      this.log(`[${args.device.getName()}] Condition 'chargerMode' triggered`);
      let mode = args.device.getCapabilityValue('mode');
      this.log(`[${args.device.getName()}] - current mode: ${mode}, condition mode: '${args.mode}`);
      return mode === args.mode;
    });

    // Actions
    this.flowCards.modeControl = this.homey.flow.getActionCard('modeControl');
    this.flowCardListeners.modeControl = this.flowCards.modeControl.registerRunListener(async (args) => {
      this.log(`[${args.device.getName()}] Action 'modeControl' triggered with ${args.mode}`);
      let errMsg = `Failed to change status to '${args.mode}'`;
      return args.device.setMode(args.mode)
        .then(() => Promise.resolve(true))
        .catch(() => Promise.reject(errMsg));
    });
  }

  async triggerDeviceFlow(flow: string, tokens: Record<string, unknown>, device: Homey.Device) {
    this.log(`[${device.getName()}] Triggering device flow '${flow}' with tokens`, tokens);
    try {
      const triggerCard = this.flowCards[flow] as Homey.FlowCardTriggerDevice;
      await triggerCard.trigger(device, tokens);
    } catch (e) {
      this.error(e);
    }
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

      let result: { data: Status };
      try {
        const options = {
          timeout: 4000,
          json: true,
          protocol: 'http:',
          hostname: data.settings.host,
          port: 8080,
          path: `/${statusUrl}${(new Date()).getTime()}`,
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
      if (!result?.data?.serialNumber) {
        throw new Error('The device on this IP address does not appear to be a Garo charger.');
      }
      return {
        ...data,
        data: {
          id: result.data.serialNumber,
        }
      };
    });

    // Received when a view has changed
    session.setHandler("showView", async function (viewId: string) {
      console.log("View: " + viewId);
    });
  }
}

module.exports = ChargerDriver;
