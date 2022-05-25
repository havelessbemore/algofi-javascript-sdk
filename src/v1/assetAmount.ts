// INTERFACE

export default class AssetAmount {
  public underlying: number
  public usd: number
  
  constructor(underlying: number, usd: number) {
    this.underlying = underlying
    this.usd = usd
  }
}