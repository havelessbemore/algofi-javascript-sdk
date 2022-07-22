// IMPORTS
import http from "http"

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
    http.get(ANALYTICS_ENDPOINT + "/assets", (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
      let error;

      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }

      if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          for (const assetInfo of parsedData.body.assets) {
            this.assets[assetInfo.asset_id] = new Asset(assetInfo.asset_id, assetInfo.name, assetInfo.decimals, assetInfo.price)
          }
        } catch (e) {
          console.error(e.message);
        }
      });
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
    });
    
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
