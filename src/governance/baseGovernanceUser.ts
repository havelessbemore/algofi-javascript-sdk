// IMPORTS

// global
import AlgofiClient from "../algofiClient"

// v2 (aliased)
import V1GovernanceUser from "./v1/governanceUser"

// INTERFACE

export default class BaseLendingUser {
  public v1: V1GovernanceUser

  constructor(algofiClient: AlgofiClient, address: string) {
		this.v1 = algofiClient.governance.v1.getUser(address)
  }

  async loadState(userLocalStates: {}) {
    this.v1.loadState(userLocalStates)
  }
}