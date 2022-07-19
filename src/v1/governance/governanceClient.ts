// IMPORTS

// external
import { Algodv2 } from "algosdk"

// global
import AlgofiClient from "./../algofiClient"
import { Network } from "./../globals"
import Admin from "./admin"
import RewardsManager from "./rewardsManager"

// local
import GovernanceConfig, { GovernanceConfigs } from "./governanceConfig"
import VotingEscrow from "./votingEscrow"
import GovernanceUser from "./governanceUser"

export default class GovernanceClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public admin: Admin
  public votingEscrow: VotingEscrow
  public rewardsManager: RewardsManager
  public govConfig: GovernanceConfig

  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.govConfig = GovernanceConfigs[this.network]
  }

  async loadState() {
    // Creating new Admin + Proposal Factory and filling in state
    this.admin = new Admin(this, this.govConfig)
    this.admin.loadState()

    // Creating new Voting Escrow and filling in state
    this.votingEscrow = new VotingEscrow(this, this.govConfig)
    this.votingEscrow.loadState()

    // Put in empty load state function
    this.rewardsManager= new RewardsManager()
  }

  getUser(address: string): GovernanceUser {
    return new 
  }
  async getOptInTxns() {}
}
