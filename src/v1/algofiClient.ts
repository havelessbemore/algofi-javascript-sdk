// IMPORTS

// external
import algosdk, { Algodv2, Indexer } from "algosdk"

// local
import { Network } from "./globals"
import AlgofiUser from "./algofiUser"

// asset data
import AssetDataClient from "./assetData/assetDataClient"

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
  public indexer: Indexer
  public network: Network

  // asset data
  public assetData: AssetDataClient

  // lending
  public lending: LendingClient

  // staking
  public staking: StakingClient

  // v1 staking
  public v1Staking: V1StakingClient

  // governance
  public governance: GovernanceClient

  constructor(algod: Algodv2, indexer: Indexer, network: Network) {
    this.algod = algod
    this.indexer = indexer
    this.network = network
    
    // assetData
    this.assetData = new AssetDataClient(this)

    // lending
    this.lending = new LendingClient(this)

    // staking
    this.staking = new StakingClient(this)

    // v1 staking
    this.v1Staking = new V1StakingClient(this)

    // governance
    this.governance = new GovernanceClient(this)
  }

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

  async getUser(address: string): Promise<AlgofiUser> {
    let user = new AlgofiUser(this, address)
    await user.loadState()
    return user
  }
}
