// IMPORTS

// global
import AlgofiClient from "../algofiClient"

// v1 (aliased)
import V1AMMClient from "./v1/ammClient"

// INTERFACE

export default class BaseLendingClient {
  public v1: V1AMMClient

  constructor(algofiClient: AlgofiClient) {
    this.v1 = new V1AMMClient(algofiClient)
  }

  async loadState() {
    await this.v1.loadState()
  }

}