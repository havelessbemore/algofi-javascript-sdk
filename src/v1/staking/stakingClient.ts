// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// global
import { Network } from "./../globals"
import AlgofiClient from "./../algofiClient"

// local
import StakingConfig, { StakingConfigs, rewardsManagerAppId } from "./stakingConfig"
import Staking from "./staking"
import StakingUser from "./stakingUser"

// INTERFACE

export default class StakingClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
	public stakingConfigs: StakingConfig[]
	public stakingContracts: { [key: number]: Staking }
  
  constructor(
    algofiClient: AlgofiClient
  ) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
		this.stakingConfigs = StakingConfigs[this.network]
  }
  
  async loadState() {

		this.stakingContracts = {}
    await Promise.all(
      this.stakingConfigs.map(async (config) => {
        const newStaking = new Staking(this.algod, this, rewardsManagerAppId[this.network], config)
        await newStaking.loadState()
        this.stakingContracts[config.appId] = newStaking
      })
    )
	}

	getStaking(stakingConfig) {
		return new Staking(this.algod, this, 94796687, stakingConfig)
	}

  getUser(address: string) : StakingUser {
    return new StakingUser(this, address)
  }
}





