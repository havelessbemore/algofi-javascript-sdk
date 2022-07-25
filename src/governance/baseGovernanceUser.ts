// IMPORTS

// global
import AlgofiClient from "../algofiClient"
import { Network } from "../globals"

// v1 (aliased)
import V1GovernanceUser from "./v1/governanceUser"

// INTERFACE

export default class BaseLendingUser {
  public v1: V1GovernanceUser
  
  // temp
  public network: Network

  constructor(algofiClient: AlgofiClient, address: string) {
		this.v1 = algofiClient.governance.v1.getUser(address)
		this.network = algofiClient.network
  }

  async loadState(userLocalStates: {}) {
    // disable on mainnet until launched
    if (this.network != Network.MAINNET) {
      this.v1.loadState(userLocalStates)
    }
  }
}