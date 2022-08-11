// IMPORTS

// external
import algosdk, { Algodv2, Transaction, assignGroupID } from "algosdk"
import request from 'superagent';

// global
import { Network, getAnalyticsEndpoint, getNetworkName } from "../../globals"
import AlgofiClient from "../../algofiClient" 
import AlgofiUser from "../../algofiUser"

// local
import { PoolType } from "./ammConfig"
import ManagerConfig, { ManagerConfigs } from "./managerConfig"
import PoolConfig from "./poolConfig"
import Pool from "./pool"

// INTERFACE

export default class AMMClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public managerAppId: number
  public pools: { [key: number]: Pool } = {} // appId -> pool
  public assetPoolMap : { [key: number]: Pool[] } = {} // asset -> pools
  public poolMap: { [key: number] : { [key: number] : { [key: number] : Pool } } } = {} // asset1, asset2, type -> pool
  public lpPoolMap: { [key: number]: Pool } = {} // lp asset id -> pool

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.managerAppId = ManagerConfigs[this.network].appId
  }

  async loadState() {
    // pre-load known pools // TODO might not want to hit this every time
    request
      .get(getAnalyticsEndpoint(this.network) + "/pools?network=" + getNetworkName(this.network))
      .then(resp => {
         if (resp.status == 200) {
           for (const poolInfo of resp.body) {
              let config = new PoolConfig(poolInfo.app_id, poolInfo.asset1_id, poolInfo.asset2_id, poolInfo.lp_asset_id, PoolType[poolInfo.type as keyof typeof PoolType])
              // pools
              this.pools[config.appId] = new Pool(this.algod, this, config)
              // assetPoolMap
              if (!(config.asset1Id in this.assetPoolMap)) {
                this.assetPoolMap[config.asset1Id] = []
              }
              if (!(config.asset2Id in this.assetPoolMap)) {
                this.assetPoolMap[config.asset2Id] = []
              }
              this.assetPoolMap[config.asset1Id].push(this.pools[config.appId])
              this.assetPoolMap[config.asset2Id].push(this.pools[config.appId])
              // poolMap
              if (!(config.asset1Id in this.poolMap)) {
                this.poolMap[config.asset1Id] = {}
              }
              if (!(config.asset2Id in this.poolMap[config.asset1Id])) {
                this.poolMap[config.asset1Id][config.asset2Id] = {}
              }
              this.poolMap[config.asset1Id][config.asset2Id][config.poolType] = this.pools[config.appId]
              // lpPoolMap
              this.lpPoolMap[config.lpAssetId] = this.pools[config.appId]
           }
         } else {
           console.log("Bad Response")
         }
      })
      .catch(err => {
        console.log(err.message)
      });
  }
  
  async getPool(assetAId: number, assetBId: number, poolType: PoolType) {
    if (assetAId == assetBId) {
      throw new Error("Asset IDs must differ")
    }
    
    // normalize asset order
    let asset1Id = (assetAId < assetBId) ? assetAId : assetBId
    let asset2Id = (assetAId < assetBId) ? assetBId : assetAId
    
    console.log("LOOK FOR POOL", asset1Id, asset2Id, poolType)
    console.log(this.poolMap)
    
    if (this.poolMap?.[asset1Id]?.[asset2Id]?.[poolType]) {
      await this.poolMap[asset1Id][asset2Id][poolType].loadState()
      return this.poolMap[asset1Id][asset2Id][poolType]
    }
    
    if (poolType == PoolType.NANO || poolType == PoolType.MOVING_RATIO_NANO) {
      throw new Error("pool not found")
    }

    let pool = new Pool(this.algod, this, new PoolConfig(0, asset1Id, asset2Id, 0, poolType))
    await pool.loadState()
    return pool
  }
}
