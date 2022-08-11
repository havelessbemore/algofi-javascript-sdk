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
  public lpAssetId: number
  public poolType: PoolType

  constructor(appId: number, asset1Id: number, asset2Id: number, lpAssetId: number, poolType: PoolType) {
    this.appId = appId
    this.asset1Id = asset1Id
    this.asset2Id = asset2Id
    this.lpAssetId = lpAssetId
    this.poolType = poolType
  }
}