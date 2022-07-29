// IMPORTS

// local
import AssetData from "./assetData"

// global
import { roundUp, roundDown } from "../utils"

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
    if (!this.assetData.price || this.assetData.price == 0) {
      console.log("Error: unable to get dollarized price for asset:", this.assetData)
      return 0
    }
    return this.amount * this.assetData.price / 10**this.assetData.decimals
  }

  toDisplayAmount(roundResultUp: boolean = false): number {
    if (roundResultUp) {
      return roundUp(this.amount / 10**this.assetData.decimals, this.assetData.decimals)
    } else {
      return roundDown(this.amount / 10**this.assetData.decimals, this.assetData.decimals)
    }
  }
  
  
}
