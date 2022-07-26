// IMPORTS

// local
import AssetData from "./assetData"

// global
import { roundDown } from "../utils"

// INTERFACE

export default class AssetAmount {
  public amount: number
  public assetData: AssetData

  /**
   * Constructor for the asset class
   * 
   * @param amount - quantity of underlying asset
   * @param assetData - assetData object
   */
  constructor(amount: number, assetData: AssetData) {
    this.amount = amount
    this.assetData = assetData
  }
  
  toUSD(): number {
    if (this.assetData.price != 0) {
      return this.amount * this.assetData.price / 10**this.assetData.decimals
    } else {
      console.log("Error: unable to get dollarized price for asset")
      return 0
    }
  }
  
  toDisplayAmount(): number {
    return roundDown(this.amount / 10**this.assetData.decimals, this.assetData.decimals) // TODO maybe up?
  }
  
  
}
