// IMPORTS
const fetch = require('node-fetch')

// external
import { Algodv2 } from "algosdk"

// global
import AlgofiClient from "./../algofiClient"
import { Network, ANALYTICS_ENDPOINT } from "./../globals"

// lending
import { MarketType } from "./../lending/v2/lendingConfig"

// local
import AssetConfig, { AssetConfigs } from "./assetConfig"
import Asset from "./asset"

// INTERFACE

export default class AssetDataClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public assetConfigs: AssetConfig[]
  public assets: { [key: number]: Asset } = {}

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.assetConfigs = AssetConfigs[this.network]
  }

  async loadState() {
    // load prices from amm analytics
    try {
      const response = await fetch(ANALYTICS_ENDPOINT + "/assets");
      if (response.ok) {
        const data = await response.json();
        for (const assetInfo of data.body.assets) {
          this.assets[assetInfo.asset_id] = new Asset(assetInfo.asset_id, assetInfo.name, assetInfo.decimals, assetInfo.price)
        }
      }
    } catch (error) {
      console.log(error)
      console.log("Error: failed to load assets from analytics endpoint")
    }
    
    // load prices from oracles (v2 lending)
    for (const [appId, market] of Object.entries(this.algofiClient.lending.v2.markets)) {
      // load underlying asset
      let underlyingAssetConfig = this.assetConfigs[market.underlyingAssetId]
      this.assets[underlyingAssetConfig.assetId] = new Asset(
        underlyingAssetConfig.assetId,
        underlyingAssetConfig.name,
        underlyingAssetConfig.decimals,
        market.oracle.price
      )
      // load b asset
      if (market.marketType != MarketType.VAULT) { // vault b assets are permenantly locked
        let bAssetConfig = this.assetConfigs[market.bAssetId]
        this.assets[bAssetConfig.assetId] = new Asset(
          bAssetConfig.assetId,
          bAssetConfig.name,
          bAssetConfig.decimals,
          market.bAssetToAssetAmount(10**bAssetConfig.decimals).usd
        )
      }
    }
  }

  toUSD(assetId, amount) {
    if (assetId in this.assets && this.assets[assetId].price > 0) {
      return (amount / 10**this.assets[assetId].decimals) * this.assets[assetId].price
    }
    console.log("Error: unable to get dollarized price for asset")
    return 0
  }

}
