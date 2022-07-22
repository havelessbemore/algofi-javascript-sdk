// IMPORTS

// global
import AlgofiClient from "../algofiClient"

// v1 (aliased)
import V1GovernanceClient from "./v1/governanceClient"

// INTERFACE

export default class BaseLendingClient {
  public v1: V1GovernanceClient

  constructor(algofiClient: AlgofiClient) {
    this.v1 = new V1GovernanceClient(algofiClient)
  }

  async loadState() {
    await this.v1.loadState()
  }

}