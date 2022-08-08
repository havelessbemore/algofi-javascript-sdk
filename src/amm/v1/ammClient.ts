// IMPORTS

// external
import algosdk, { Algodv2, Transaction, assignGroupID } from "algosdk"

// global
import { Network } from "../../globals"
import AlgofiClient from "../../algofiClient" 
import AlgofiUser from "../../algofiUser"

// local
import { PoolType } from "./ammConfig"
import PoolConfig, { PoolConfigs } from "./poolConfig"
import Pool from "./pool"

// INTERFACE

export default class LendingClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public poolConfigs: PoolConfig[]
  public pools: { [key: number]: Pool } = {}

  /**
   * Constructor for the algofi lending client.
   * 
   * @param algofiClient - an instance of an algofi client
   */
  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.poolConfigs = PoolConfigs[this.network]
  }

  /**
   * Call load stat eand update all of the user's market and load it into the object.
   */
  async loadState() {
    // DO NOT LOAD STATE FOR ALL POOLS AT STARTUP, THERE ARE TOO MANY
    for (const poolConfig of this.poolConfigs) {
      this.pools[poolConfig.appId] = new Pool(this.algod, this, poolConfig)
      if (poolConfig.poolType == PoolType.LENDING_NANO) {
        this.pools[poolConfig.appId].loadState()
      }
    }
  }
}
