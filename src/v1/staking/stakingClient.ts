// IMPORTS

// external
import { Algodv2 } from "algosdk"

// global
import AlgofiClient from "./../algofiClient"
import { Network } from "./../globals"

// local
import Staking from "./staking"
import StakingConfig, { rewardsManagerAppId, StakingConfigs } from "./stakingConfig"
import StakingUser from "./stakingUser"

// INTERFACE

export default class StakingClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public stakingConfigs: StakingConfig[]
  public stakingContracts: { [key: number]: Staking }

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.stakingConfigs = StakingConfigs[this.network]
  }

  async loadState() {
    const newStakingContracts = await Promise.all(
      this.stakingConfigs.map(async config => {
        const newStaking = new Staking(this.algod, this, rewardsManagerAppId[this.network], config)
        await newStaking.loadState()
        return { [config.appId]: newStaking }
      })
    )
    this.stakingContracts = newStakingContracts.reduce((acc, value) => {
      acc = { ...acc, ...value }
      return acc
    }, {})
  }

  getUser(address: string): StakingUser {
    return new StakingUser(this, address)
  }
}
