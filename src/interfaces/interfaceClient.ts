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
        }
        await this.lendingPools[config.appId].loadState()
      })
    )
  }

}
