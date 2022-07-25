// IMPORTS

// global
import AlgofiClient from "../algofiClient"

// v1 (aliased)
import V1StakingUser from "./v1/stakingUser"

// v2 (aliased)
import V2StakingUser from "./v2/stakingUser"

// INTERFACE

export default class BaseStakingUser {
  public v1: V1StakingUser
  public v2: V2StakingUser

  constructor(algofiClient: AlgofiClient, address: string) {
		this.v1 = algofiClient.staking.v1.getUser(address)
		this.v2 = algofiClient.staking.v2.getUser(address)
  }

  async loadState(userLocalStates: {}) {
    await this.v1.loadState(userLocalStates)
    await this.v2.loadState(userLocalStates)
  }
}