// INTERFACE

export default class ParsedTransaction {
  public transactionId: string
  public groupId: string
  public block: number
  public time: number
  public protocol: string
  public app: number
  public action: string
  public params: string[]
  public assetIn: number
  public amountIn: number
  public assetOut: number
  public amountOut: number

  constructor(
    transaction: {},
    protocol: string,
    app: number,
    action: string,
    params: string[],
    assetIn: number,
    amountIn: number,
    assetOut: number,
    amountOut: number,
  ) {
    this.transactionId = transaction['id']
    this.groupId = transaction['group']
    this.block = transaction['confirmed-round']
    this.time = transaction['round-time']
    this.protocol = protocol
    this.app = app
    this.action = action
    this.params = params
    this.assetIn = assetIn
    this.amountIn = amountIn
    this.assetOut = assetOut
    this.amountOut = amountOut
  }
}
