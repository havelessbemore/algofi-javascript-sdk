// IMPORTS

// global
import AssetAmount from "./../assetAmount"

// local
import { MARKET_STRINGS } from "./lendingConfig"
import Market from "./market"

// INTERFACE

export default class UserMarketState {
  public b_asset_collateral: number
  public borrow_shares: number

  public suppliedAmount: AssetAmount
  public borrowedAmount: AssetAmount

  constructor(marketState: { string: any }, market: Market) {
    this.b_asset_collateral = marketState[MARKET_STRINGS.user_active_b_asset_collateral] || 0
    this.borrow_shares = marketState[MARKET_STRINGS.user_borrow_shares] || 0
    this.suppliedAmount = market.bAssetToAssetAmount(this.b_asset_collateral)
    this.borrowedAmount = market.borrowSharesToAssetAmount(this.borrow_shares)
  }
}
