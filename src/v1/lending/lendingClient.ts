// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// global
import { Network } from "./../globals"
import AssetConfig from "./../assetConfig"
import AlgofiClient from "./../algofiClient"

// local
import { MarketType } from "./lendingConfig"
import ManagerConfig, { ManagerConfigs } from "./managerConfig"
import MarketConfig, { MarketConfigs } from "./marketConfig"
import Manager from "./manager"
import Market from "./market"
import LendingUser from "./lendingUser"
import Oracle from "./oracle"

// INTERFACE

export default class LendingClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  
  public managerConfig: ManagerConfig
  public manager: Manager
  
  public marketConfigs: MarketConfig[]
  public markets: { [key: number]: Market } = {}
  
  constructor(
    algofiClient: AlgofiClient
  ) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.managerConfig = ManagerConfigs[this.network]
    this.marketConfigs = MarketConfigs[this.network]
    
    this.manager = new Manager(this.algod, this.managerConfig.appId)
  }
  
  async loadState() {
    await Promise.all(
      this.marketConfigs.map(async (config) => {
        const newMarket = new Market(this.algod, this, this.manager.appId, config)
        await newMarket.loadState()
        this.markets[config.appId] = newMarket
      })
    )
  }
  
  getUser(address: string) : LendingUser {
    return new LendingUser(this, address)
  }
}