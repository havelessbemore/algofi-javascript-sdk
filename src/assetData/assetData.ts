// INTERFACE

export default class AssetData {
  public assetId: number
  public name: string
  public unitName: string
  public decimals: number
  public price: number

  constructor(assetId: number, name: string, unitName: string, decimals: number, price: number) {
    this.assetId = assetId
    this.name = name
    this.unitName = unitName
    this.decimals = decimals
    this.price = price
  }
}