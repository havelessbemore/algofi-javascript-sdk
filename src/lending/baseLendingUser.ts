// IMPORTS

// global
import AlgofiClient from "../algofiClient"

// v2 (aliased)
import V2LendingUser from "./v2/lendingUser"

// INTERFACE

export default class BaseLendingUser {
  public v2: V2LendingUser

  constructor(algofiClient: AlgofiClient, address: string) {
		this.v2 = algofiClient.lending.v2.getUser(address)
  }

  async loadState(userLocalStates: {}) {
    await this.v2.loadState(userLocalStates)
  }
}