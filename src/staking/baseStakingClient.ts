// IMPORTS

// global
import AlgofiClient from "../algofiClient"

// v1 (aliased)
import V1StakingClient from "./v1/stakingClient"

// v2 (aliased)
import V2StakingClient from "./v2/stakingClient"

// INTERFACE

export default class BaseStakingClient {
  public v1: V1StakingClient
  public v2: V2StakingClient

  constructor(algofiClient: AlgofiClient) {
    this.v1 = new V1StakingClient(algofiClient)
    this.v2 = new V2StakingClient(algofiClient)
  }

  async loadState() {
    await this.v1.loadState()
    await this.v2.loadState()
  }

}