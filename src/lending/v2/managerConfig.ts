// IMPORTS

// globals
import { Network } from "../../globals"

// INTERFACE

export default class ManagerConfig {
  public appId: number

  /**
   * Constructor for the manager config class.
   * 
   * @param appId - manager app id
   */
  constructor(appId: number) {
    this.appId = appId
  }
}

export const ManagerConfigs = {
  [Network.MAINNET]: new ManagerConfig(818176933),
  [Network.MAINNET_CLONE3]: new ManagerConfig(812891680),
}
