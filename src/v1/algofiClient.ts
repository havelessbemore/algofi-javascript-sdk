// IMPORTS

// external
import algosdk, { Algodv2 } from "algosdk"

// local
import { Network } from "./globals"
import AssetConfig, { AssetConfigs } from "./assetConfig"
import AlgofiUser from "./algofiUser"

// lending
import LendingClient from "./lending/lendingClient"

// staking
import StakingClient from "./staking/stakingClient"

// v1 staking
import V1StakingClient from "./v1_staking/v1_stakingClient"

// INTERFACE

export default class AlgofiClient {
  public algod: Algodv2
  public network: Network

  public assets: { [key: number]: AssetConfig } = {}

  // lending
  public lending: LendingClient

  // staking
  public staking: StakingClient

  // v1 staking
  public v1Staking: V1StakingClient

  constructor(algod: Algodv2, network: Network) {
    this.algod = algod
    this.network = network
    this.assets = AssetConfigs[this.network]

    // lending
    this.lending = new LendingClient(this)

    // staking
    this.staking = new StakingClient(this)
    
    // v1 staking
    this.v1Staking = new V1StakingClient(this)
  }

  async loadState() {
    // lending
    await this.lending.loadState()

    // staking
    await this.staking.loadState()
    
    // v1 staking
    await this.v1Staking.loadState()
  }

  async getUser(address: string): Promise<AlgofiUser> {
    let user = new AlgofiUser(this, address)
    await user.loadState()
    return user
  }
}
