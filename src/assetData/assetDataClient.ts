// IMPORTS

// external
import { Algodv2 } from "algosdk"
import request from 'superagent';

// global
import AlgofiClient from "./../algofiClient"
import { Network, getAnalyticsEndpoint, getNetworkName } from "./../globals"

// lending
import { MarketType } from "./../lending/v2/lendingConfig"

// local
import AssetConfig, { AssetConfigs } from "./assetConfig"
import AssetData from "./assetData"
import AssetAmount from "./assetAmount"

// INTERFACE

export default class AssetDataClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public assetConfigs: { [key: number]: AssetConfig}

  public assets: { [key: number]: AssetData } = {}

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.assetConfigs = AssetConfigs[this.network]
  }

  async loadState() {
    // load configured assets
    for (const [assetId, assetConfig] of Object.entries(this.assetConfigs)) {
      if (assetConfig.assetId in this.assets) { // do not overwrite already loaded data
        continue
      }
      this.assets[assetConfig.assetId] = new AssetData(
        assetConfig.assetId,
        assetConfig.name,
        assetConfig.unitName,
        assetConfig.decimals,
        assetConfig.defaultPrice
      )
    }

    // load prices from amm analytics
    request
      .get(getAnalyticsEndpoint(this.network) + "/assets?network=" + getNetworkName(this.network))
      .then(resp => {
         if (resp.status == 200) {
           for (const assetInfo of resp.body) {
             this.assets[assetInfo.asset_id] = new AssetData(assetInfo.asset_id, assetInfo.name, assetInfo.unit_name, assetInfo.decimals, assetInfo.price)
           }
         } else {
           console.log("Bad Response")
         }
      })
      .catch(err => {
        console.log(err.message)
      });

    // load lp prices from amm analytics
    request
      .get(getAnalyticsEndpoint(this.network) + "/ammLPTokens?network=" + getNetworkName(this.network))
      .then(resp => {
         if (resp.status == 200) {
           for (const assetInfo of resp.body) {
             this.assets[assetInfo.asset_id] = new AssetData(assetInfo.asset_id, assetInfo.name, assetInfo.unit_name, assetInfo.decimals, assetInfo.price)
           }
         } else {
           console.log("Bad Response")
         }
      })
      .catch(err => {
        console.log(err.message)
      });
  }

  async loadLendingAssetState() {
    // load prices from oracles (v2 lending)
    for (const [appId, market] of Object.entries(this.algofiClient.lending.v2.markets)) {
      // load underlying asset
      let underlyingAssetConfig = this.assetConfigs[market.underlyingAssetId]
      this.assets[underlyingAssetConfig.assetId] = new AssetData(
        underlyingAssetConfig.assetId,
        underlyingAssetConfig.name,
        underlyingAssetConfig.unitName,
        underlyingAssetConfig.decimals,
        market.oracle.price
      )
      // load b asset
      if (market.marketType != MarketType.VAULT) { // vault b assets are permenantly locked
        let bAssetConfig = this.assetConfigs[market.bAssetId]
        this.assets[bAssetConfig.assetId] = new AssetData(
          bAssetConfig.assetId,
          bAssetConfig.name,
          bAssetConfig.unitName,
          bAssetConfig.decimals,
          market.bAssetToUnderlying(10**bAssetConfig.decimals).toUSD()
        )
      }
    }
  }

  getAsset(amount: number, assetId: number): AssetAmount {
    return new AssetAmount(amount, this.assets[assetId])
  }

  getAssetFromDisplayAmount(displayAmount: number, assetId: number): AssetAmount {
    const assetData = this.assets[assetId]
    return new AssetAmount(Math.floor(displayAmount * 10**assetData.decimals), assetData)
  }
  
  getAssetFromUSDAmount(usdAmount: number, assetId): AssetAmount {
    const assetData = this.assets[assetId]
    return new AssetAmount(Math.floor(usdAmount * 10**assetData.decimals / assetData.price), assetData)
  }

}
