// IMPORTS

// external
import { Algodv2 } from "algosdk"

// global
import AlgofiClient from "../../algofiClient"
import { Network } from "../../globals"

// local
import Staking from "./staking"
import StakingConfig, { StakingConfigs } from "./stakingConfig"
import StakingUser from "./stakingUser"

// INTERFACE

export default class StakingClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public stakingConfigs: StakingConfig[]
  public stakingContracts: { [key: number]: Staking } = {}

  /**
   * Constructor for the staking client.
   * 
   * @param algofiClient - algofi client
   */
  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.stakingConfigs = StakingConfigs[this.network]
  }

  /**
   * Function to load in the staking contracts from the config and update their
   * internal object state with what is represented on chain.
   */
  async loadState() {
    await Promise.all(
      this.stakingConfigs.map(async config => {
        if (!(config.managerAppId in this.stakingContracts)) {
          this.stakingContracts[config.managerAppId] = new Staking(this.algod, this, config)
        }
        await this.stakingContracts[config.managerAppId].loadState()
      })
    )
  }

  /**
   * Function to create a v1 staking user from an address.
   * 
   * @param address - address of user
   * @returns a constructed v1 staking user.
   */
  getUser(address: string): StakingUser {
    return new StakingUser(this, address)
  }
}
