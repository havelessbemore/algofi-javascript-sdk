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
    const newAdmin = new Admin(this, this.govConfig)
    newAdmin.loadState()
    this.admin = newAdmin

    // Creating new Voting Escrow and filling in state
    const newVotingEscrow = new VotingEscrow(this, this.govConfig)
    newVotingEscrow.loadState()
    this.votingEscrow = newVotingEscrow

    const newRewardsManager = new RewardsManager()
    this.rewardsManager = newRewardsManager
  }

  async getOptInTxns() {}
}
