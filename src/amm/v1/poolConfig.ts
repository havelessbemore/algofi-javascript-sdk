// IMPORTS

// global
import { Network } from "../../globals"

// local
import { PoolType } from "./ammConfig"

// INTERFACE

export default class PoolConfig {
  public appId: number
  public asset1Id: number
  public asset2Id: number
  public poolType: PoolType

  constructor(appId: number, asset1Id: number, asset2Id: number, poolType: PoolType) {
    this.appId = appId
    this.asset1Id = asset1Id
    this.asset2Id = asset2Id
    this.poolType = poolType
  }
}

export const PoolConfigs = {
  [Network.MAINNET]: [
    new PoolConfig(1, 2, 3, PoolType.MOVING_RATIO_NANO),
  ],
  [Network.TESTNET]: [
    new PoolConfig(1, 2, 3, PoolType.MOVING_RATIO_NANO),
  ],
}
