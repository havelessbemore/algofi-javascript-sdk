// IMPORTS

// global
import AlgofiClient from "../algofiClient"

// v2 (aliased)
import V2SLendingClient from "./v2/lendingClient"

// INTERFACE

export default class BaseLendingClient {
  public v2: V2SLendingClient

  constructor(algofiClient: AlgofiClient) {
    this.v2 = new V2SLendingClient(algofiClient)
  }

  async loadState() {
    await this.v2.loadState()
  }

}