export const baseUrl = 'servlet/rest/chargebox'; // Prefix with http://192.168.123:8080 device address
export const setModeUrl = `${baseUrl}/mode`; // /ALWAYS_OFF /SCHEMA /ALWAYS_ON - see Mode type
export const statusUrl = `${baseUrl}/status?_=`;
export const meterInfoUrl = `${baseUrl}/meterinfo/EXTERNAL?_=`
export const energyUrl = `${baseUrl}/energy`;
export const configUrl = `${baseUrl}/config?_=`;
export const currentLimitUrl = `${baseUrl}/currentlimit`
