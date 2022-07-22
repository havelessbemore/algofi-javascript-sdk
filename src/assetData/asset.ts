// INTERFACE

export default class Asset {
  public assetId: number
  public name: string
  public decimals: number
  public price: number

  constructor(assetId: number, name: string, decimals: number, price: number) {
    this.assetId = assetId
    this.name = name
    this.decimals = decimals
    this.price = price
  }
}