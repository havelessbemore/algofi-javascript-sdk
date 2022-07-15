// IMPORTS

// external
import { Algodv2 } from "algosdk"

// global
import AlgofiClient from "./../algofiClient"
import { Network } from "./../globals"

// local
import V1Staking from "./v1_staking"
import V1StakingConfig, { V1StakingConfigs } from "./v1_stakingConfig"
import V1StakingUser from "./v1_stakingUser"

// INTERFACE

export default class StakingClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public stakingConfigs: V1StakingConfig[]
  public stakingContracts: { [key: number]: V1Staking }

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.stakingConfigs = V1StakingConfigs[this.network]
  }

  async loadState() {
    this.stakingContracts = {}
    
    await Promise.all(
      this.stakingConfigs.map(async config => {
        const staking = new V1Staking(this.algod, this, config)
        await staking.loadState()
        this.stakingContracts[config.managerAppId] = staking
      })
    )
  }

  getUser(address: string): V1StakingUser {
    return new V1StakingUser(this, address)
  }
}
