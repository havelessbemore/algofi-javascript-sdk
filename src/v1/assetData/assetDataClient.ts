// IMPORTS

// external
import { Algodv2 } from "algosdk"

// global
import AlgofiClient from "./../algofiClient"
import { Network, ANALYTICS_ENDPOINT } from "./../globals"

// local
import AssetConfig, { AssetConfigs } from "./assetConfig"

// INTERFACE

export default class AssetDataClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public assetConfigs: AssetConfig[]

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.assetConfigs = AssetConfigs[this.network]
  }

  async loadState() {
    let analyticsAssetInfo = await fetch(ANALYTICS_ENDPOINT + "/assets")
    console.log(analyticsAssetInfo)

    
  }

}
