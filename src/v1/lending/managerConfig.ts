// IMPORTS

// globals
import { Network } from "./../globals"

// INTERFACE

export default class ManagerConfig {
  public appId: number

  constructor(appId: number) {
    this.appId = appId
  }
}

export const ManagerConfigs = {
  [Network.MAINNET]: new ManagerConfig(0),
  [Network.MAINNET_CLONE]: new ManagerConfig(753081696),
  [Network.TESTNET]: new ManagerConfig(91633688)
}
