import axios from 'axios';

import env from '../../env';

/**
 * Makes a GET request to the Shelly with a 5 seconds timeout
 * Returns the response body data
 * @param url URL to be queried
 */
const makeGetRequest = async (url: string): Promise<any> => (await axios.get(url, { timeout: 5000 })).data;

/**
 * Checks if there is a vehicle present on the induction loop
 * Returns true if a vehicle is present, false otherwise
 * @param ip IP address of the gate which induction loop will be checked
 */
const checkGateInductionLoop = async (ip: string): Promise<boolean> => {
  const url = `http://${ip}/rpc/Input.GetStatus?id=0`;
  const result = await makeGetRequest(url);
  return result.state === true;
};

/**
 * Checks if the boom is missing
 * Returns true if the boom is missing, false otherwise
 * @param ip IP address of the gate which boom will be checked
 */
const checkGateBoom = async (ip: string): Promise<boolean> => {
  const url = `http://${ip}/rpc/Input.GetStatus?id=1`;
  const result = await makeGetRequest(url);
  return result.state === true;
};

/**
 * Opens a gate
 * @param ip IP address of the gate which will be opened
 */
const openGate = async (ip: string): Promise<void> => {
  const url = `http://${ip}/rpc/Switch.Set?id=0&on=true&toggle_after=1`;
  await makeGetRequest(url);
};

/**
 * Closes a gate
 * @param ip IP address of the gate which will be closed
 */
const closeGate = async (ip: string): Promise<void> => {
  const url = `http://${ip}/rpc/Switch.Set?id=1&on=true&toggle_after=1`;
  await makeGetRequest(url);
};

const entryGatesIPs: string[] = env.application.entryGatesIPs.split(',');
const exitGatesIPs: string[] = env.application.exitGatesIPs.split(',');

export const checkEntryGateInductionLoop = async (): Promise<boolean> => checkGateInductionLoop(entryGatesIPs[0]);

export const checkExitGateInductionLoop = async (): Promise<boolean> => checkGateInductionLoop(exitGatesIPs[0]);

export const checkEntryGatesBooms = async (): Promise<boolean[]> => Promise
  .all(entryGatesIPs.map(async (ip) => checkGateBoom(ip)));

export const checkExitGatesBooms = async (): Promise<boolean[]> => Promise
  .all(exitGatesIPs.map(async (ip) => checkGateBoom(ip)));

export const openEntryGates = async (): Promise<void[]> => Promise
  .all(entryGatesIPs.map(async (ip) => openGate(ip)));

export const openExitGates = async (): Promise<void[]> => Promise
  .all(exitGatesIPs.map(async (ip) => openGate(ip)));

export const closeEntryGates = async (): Promise<void[]> => Promise
  .all(entryGatesIPs.map(async (ip) => closeGate(ip)));

export const closeExitGates = async (): Promise<void[]> => Promise
  .all(exitGatesIPs.map(async (ip) => closeGate(ip)));
