import { Algodv2 } from "algosdk"
import GovernanceClient from "./governanceClient"
import { UserAdminState, UserRewardsManagerState, UserVotingEscrowState } from "./userGovernanceStates"

export default class governanceUser {
  public governanceClient: GovernanceClient
  public algod: Algodv2
  public address: string
  public userVotingEscrowState: UserVotingEscrowState
  public userAdminState: UserAdminState
  public userRewardsManagerState: UserRewardsManagerState

  constructor(governanceClient: GovernanceClient, address) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.address = address
  }

  async loadState(userLocalStates: {}) {
    // TODO implement this
    this.userVotingEscrowState = new UserVotingEscrowState()
    // TODO implement this
    this.userAdminState = new UserAdminState()
    // TODO implement this
    this.userRewardsManagerState = new UserRewardsManagerState()
  }
}
