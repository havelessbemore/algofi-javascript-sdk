// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// global
import { FIXED_3_SCALE_FACTOR } from "./../globals"
import { getApplicationGlobalState } from "./../stateUtils"

// INTERFACE

export default class Oracle {
  // static
  public algod: Algodv2
  public appId: number
  public priceFieldName: string
  public scaleFactor: number
  public underlyingAssetDecimals: number

  // state
  public rawPrice: number
  public price: number

  /**
   * Constructor for the oracle object
   * 
   * @param algod - algod client
   * @param appId - appid of the oracle
   * @param priceFieldName - price field name
   * @param scaleFactor - scale factor for the asset price
   * @param underlyingAssetDecimals - decimals for the asset
   */
  constructor(algod: Algodv2, appId: number, priceFieldName: string, scaleFactor: number, underlyingAssetDecimals: number) {
    this.algod = algod
    this.appId = appId
    this.priceFieldName = priceFieldName
    this.scaleFactor = scaleFactor
    this.underlyingAssetDecimals = underlyingAssetDecimals
  }

  /**
   * Sets raw price after getting global state.
   */
  async loadPrice() {
    let state = await getApplicationGlobalState(this.algod, this.appId)
    this.rawPrice = state[this.priceFieldName]
    this.price = this.rawPrice * this.underlyingAssetDecimals / (FIXED_3_SCALE_FACTOR * this.scaleFactor)
  }
}
