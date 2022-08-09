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

// amm
import BaseAMMClient from "./amm/baseAMMClient"

// interfaces
import InterfaceClient from "./interfaces/interfaceClient"

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

  // amm
  public amm: BaseAMMClient

  // asset data
  public assetData: AssetDataClient

  // interfaces
  public interfaces: InterfaceClient

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

    // amm
    this.amm = new BaseAMMClient(this)

    // assetData
    this.assetData = new AssetDataClient(this)
    
    // interfaces
    this.interfaces = new InterfaceClient(this)
  }

  /**
   * Function to load the state of all of the different types of clients.
   */
  async loadState() {
    // asset data
    let assetDataPromise = this.assetData.loadState()

    // lending
    let loadLendingPromise = this.lending.loadState()

    // staking
    let loadStakingPromise = this.staking.loadState()

    // governance
    let loadGovernancePromise = this.governance.loadState()

    // amm
    let loadAMMPromise = this.amm.loadState()

    // wait for all to complete
    await Promise.all([loadLendingPromise, loadStakingPromise, loadGovernancePromise, loadAMMPromise, assetDataPromise])

    // load asset data lending state (lending load must complete first)
    await this.assetData.loadLendingAssetState()

    // load interfaces (interfaces should have no local state and should purely load off of other algofi client data)
    await this.interfaces.loadState()
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
