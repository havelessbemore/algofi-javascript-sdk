// IMPORTS

// global
import AlgofiClient from "../algofiClient"
import { Network } from "../globals"

// v1 (aliased)
import V1GovernanceClient from "./v1/governanceClient"

// INTERFACE

export default class BaseLendingClient {
  public v1: V1GovernanceClient
  
  // temp
  public network: Network

  constructor(algofiClient: AlgofiClient) {
    this.v1 = new V1GovernanceClient(algofiClient)
    this.network = algofiClient.network
  }

  async loadState() {
    // disable on mainnet until launched
    if (this.network != Network.MAINNET && this.network != Network.TESTNET) {
      await this.v1.loadState()
    }
  }

}