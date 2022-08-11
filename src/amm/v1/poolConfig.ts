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
    new PoolConfig(658337046, 31566704, 465865291, PoolType.NANO),
    new PoolConfig(659677335, 312769, 465865291, PoolType.NANO),
    new PoolConfig(659678644, 312769, 31566704, PoolType.NANO),
  ],
  [Network.TESTNET]: [
    new PoolConfig(104228342, 104207173, 104217422, PoolType.MOVING_RATIO_NANO),
  ],
}

