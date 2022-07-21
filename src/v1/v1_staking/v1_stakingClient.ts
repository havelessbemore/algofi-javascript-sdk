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

  /**
   * Constructor for the staking client
   * 
   * @param algofiClient - algofi client
   */
  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.stakingConfigs = V1StakingConfigs[this.network]
  }

  /**
   * Function to load in the staking contracts from the config and update their
   * internal object state with what is represented on chain.
   */
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

  /**
   * Function to create a v1 staking user from an address
   * 
   * @param address - address of user
   * @returns a constructed v1 staking user
   */
  getUser(address: string): V1StakingUser {
    return new V1StakingUser(this, address)
  }
}
