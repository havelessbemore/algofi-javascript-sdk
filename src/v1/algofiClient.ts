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

// governance
import GovernanceClient from "./governance/governanceClient"

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

  // governance
  public governance: GovernanceClient

  /**
   * This is the constructor for the {@link AlgofiClient} class. It will set a lending
   * client, staking client, v1staking client, and governance client as well.
   *
   * @param algod - the client
   * @param network - network you want the client to be on
   */
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

    // governance
    this.governance = new GovernanceClient(this)
  }

  /**
   * This will asynchronously load state across all clients we have 
   * as attributes on the full AlgofiClient.
   */
  async loadState() {
    // lending
    await this.lending.loadState()

    // staking
    await this.staking.loadState()

    // v1 staking
    await this.v1Staking.loadState()

    // governance
    await this.governance.loadState()
  }

  /**
   * Given an address, this function will return a new instance of the {@link
   * AlgofiUser} representing that user on the Algofi protocol.
   * 
   * @param address - the public address of the user that we want to create an
   * algofiClient for.
   * @returns an {@link AlgofiUser} representing the user with that
   * address on the Algofi protocol.
   */
  async getUser(address: string): Promise<AlgofiUser> {
    let user = new AlgofiUser(this, address)
    await user.loadState()
    return user
  }
}
