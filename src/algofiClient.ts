// IMPORTS

// external
import algosdk, { Algodv2, Indexer } from "algosdk"

// local
import { Network } from "./globals"
import AlgofiUser from "./algofiUser"

// asset data
import AssetDataClient from "./assetData/assetDataClient"

// lending
import BaseLendingClient from "./lending/baseLendingClient"

// staking
import BaseStakingClient from "./staking/baseStakingClient"

// governance
import BaseGovernanceClient from "./governance/baseGovernanceClient"

// INTERFACE

export default class AlgofiClient {
  public algod: Algodv2
  public indexer: Indexer
  public network: Network

  // lending
  public lending: BaseLendingClient

  // staking
  public staking: BaseStakingClient

  // governance
  public governance: BaseGovernanceClient

  // asset data
  public assetData: AssetDataClient

  /**
   * Constructor for the algofi client class
   *
   * @param algod - algod client
   * @param indexer - indexer client
   * @param network - chain network
   */
  constructor(algod: Algodv2, indexer: Indexer, network: Network) {
    this.algod = algod
    this.indexer = indexer
    this.network = network

    // lending
    this.lending = new BaseLendingClient(this)

    // staking
    this.staking = new BaseStakingClient(this)

    // governance
    this.governance = new BaseGovernanceClient(this)
    
    // assetData
    this.assetData = new AssetDataClient(this)
  }

  /**
   * Function to load the state of all of the different types of clients.
   */
  async loadState() {
    // lending
    await this.lending.loadState()

    // staking
    await this.staking.loadState()

    // governance
    await this.governance.loadState()

    // asset data (must load AFTER lending)
    await this.assetData.loadState()
  }

  /**
   * Function to get an algofi user given an address.
   * 
   * @param address - address of the user
   * @returns an algofi user given the address passed in.
   */
  async getUser(address: string): Promise<AlgofiUser> {
    let user = new AlgofiUser(this, address)
    await user.loadState()
    return user
  }
}
