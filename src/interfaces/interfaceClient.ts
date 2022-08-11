// IMPORTS

// global
import { Network } from "../globals"
import AlgofiClient from "../algofiClient"
import AlgofiUser from "../algofiUser"

// interfaces

// - lending pool interface
import LendingPoolInterfaceConfig, { LendingPoolInterfaceConfigs } from "./lendingPoolInterfaceConfig"
import LendingPoolInterface from "./lendingPoolInterface"

// INTERFACE

export default class InterfaceClient {
  public algofiClient: AlgofiClient
  public network: Network
  
  public lendingPoolConfigs : LendingPoolInterfaceConfig[]
  public lendingPools: { [key: number]: LendingPoolInterface } = {}
  public assetLendingPoolMap: { [key: number]: { [key: number]: LendingPoolInterface } } = {}
  public lpLendingPoolMap: { [key: number]: LendingPoolInterface } = {}

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.network = this.algofiClient.network
    
    // lending pool interface
    this.lendingPoolConfigs = LendingPoolInterfaceConfigs[algofiClient.network]
    
  }

  async loadState() {
    await Promise.all(
      this.lendingPoolConfigs.map(async config => {
        if (!(config.appId in this.lendingPools)) {
          this.lendingPools[config.appId] = new LendingPoolInterface(this.algofiClient, config)
          
          if (!(config.asset1Id in this.assetLendingPoolMap)) {
            this.assetLendingPoolMap[config.asset1Id] = {}
          }
          this.assetLendingPoolMap[config.asset1Id][config.asset2Id] = this.lendingPools[config.appId]

          this.lpLendingPoolMap[config.lpAssetId] = this.lendingPools[config.appId]
        }
      })
    )
  }

  async getLendingPool(appId: number): Promise<LendingPoolInterface> {
    await this.lendingPools[appId].loadState()
    return this.lendingPools[appId]
  }

  hasLendingPoolForAssets(assetAId: number, assetBId: number): boolean {
    let asset1Id = (assetAId < assetBId) ? assetAId : assetBId
    let asset2Id = (assetAId > assetBId) ? assetAId : assetBId
    return (asset1Id in this.assetLendingPoolMap && asset2Id in this.assetLendingPoolMap[asset1Id])
  }

  async getLendingPoolFromAssets(assetAId: number, assetBId: number): Promise<LendingPoolInterface> {
    let asset1Id = (assetAId < assetBId) ? assetAId : assetBId
    let asset2Id = (assetAId > assetBId) ? assetAId : assetBId
    await this.assetLendingPoolMap[asset1Id][asset2Id].loadState()
    return this.assetLendingPoolMap[asset1Id][asset2Id]
  }

  hasLendingPoolForLP(lpAssetId: number): boolean {
    return (lpAssetId in this.lpLendingPoolMap)
  }

  async getLendingPoolFromLP(lpAssetId: number): Promise<LendingPoolInterface> {
    await this.lpLendingPoolMap[lpAssetId].loadState()
    return this.lpLendingPoolMap[lpAssetId]
  }
}
