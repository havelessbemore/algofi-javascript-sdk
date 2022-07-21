// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// global
import { getApplicationGlobalState } from "./../stateUtils"

// INTERFACE

export default class Oracle {
  // static
  public algod: Algodv2
  public appId: number
  public priceFieldName: string
  public scaleFactor: number

  // state
  public rawPrice: number

  /**
   * Constructor for the oracle object
   * 
   * @param algod - algod client
   * @param appId - appid of the oracle
   * @param priceFieldName - price field name
   * @param scaleFactor - scale factor for the asset
   */
  constructor(algod: Algodv2, appId: number, priceFieldName: string, scaleFactor: number) {
    this.algod = algod
    this.appId = appId
    this.priceFieldName = priceFieldName
    this.scaleFactor = scaleFactor
  }

  /**
   * Sets raw price after getting global state
   */
  async loadPrice() {
    let state = await getApplicationGlobalState(this.algod, this.appId)
    this.rawPrice = state[this.priceFieldName]
  }
}
