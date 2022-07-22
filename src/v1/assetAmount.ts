// INTERFACE

export default class AssetAmount {
  public underlying: number
  public usd: number

  /**
   * Constructor for the asset amount class
   * 
   * @param underlying - quantity of underlying asset
   * @param usd - usd value of underlying
   */
  constructor(underlying: number, usd: number) {
    this.underlying = underlying
    this.usd = usd
  }
}
