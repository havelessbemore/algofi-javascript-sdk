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
  
  constructor(algod: Algodv2, appId: number, priceFieldName: string, scaleFactor: number) {
    this.algod = algod
    this.appId = appId
    this.priceFieldName = priceFieldName
    this.scaleFactor = scaleFactor
  }

  async loadPrice() {
    let state = await getApplicationGlobalState(this.algod, this.appId)
    this.rawPrice = state[this.priceFieldName]
  }
  
}