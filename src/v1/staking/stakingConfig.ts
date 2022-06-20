// IMPORTS
import { Network } from "./../globals"

// INTERFACE

export default class StakingConfig {
  public appId : number
  public assetId : number
  
  constructor(
    appId : number,
	assetId : number,
  ) {
      this.appId = appId
	  this.assetId = assetId
    }
}

export const StakingConfigs = {
  [Network.MAINNET] : [
    new StakingConfig()
  ],
  [Network.TESTNET] : [
    new StakingConfig(),
    new StakingConfig(),
  ]
}
