// IMPORTS

// global
import { Network } from "../../globals"

// INTERFACE

export default class ManagerConfig {
  public appId: number

  constructor(appId: number) {
    this.appId = appId
  }
}

export const ManagerConfigs = {
  [Network.MAINNET]: new ManagerConfig(605753404),
  [Network.TESTNET]: new ManagerConfig(104225849)
}

