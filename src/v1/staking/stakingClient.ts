// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// global
import { Network } from "./../globals"
import AlgofiClient from "./../algofiClient"

// local
import StakingConfig, { StakingConfigs } from "./stakingConfig"
import Staking from "./staking"
import StakingUser from "./stakingUser"

// INTERFACE

export default class StakingClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
	public stakingConfigs: StakingConfig[]
  
  constructor(
    algofiClient: AlgofiClient
  ) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
		this.stakingConfigs = StakingConfigs[this.network]
  }
  
  async loadState(): Promise<{}> {
		return {}
	}

	getStaking(stakingConfig) {
		return new Staking(this.algod, this, 94796687, stakingConfig)
	}

  getUser(address: string) : StakingUser {
    return new StakingUser(this, address)
  }
}





