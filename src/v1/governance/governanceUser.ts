import { Algodv2 } from "algosdk"
import { getLocalStates } from "../stateUtils"
import { parseAddressBytes } from "../utils"
import GovernanceClient from "./governanceClient"
import { ADMIN_STRINGS } from "./governanceConfig"
import { UserAdminState, UserRewardsManagerState, UserVotingEscrowState } from "./userGovernanceStates"

export default class governanceUser {
  public governanceClient: GovernanceClient
  public algod: Algodv2
  public address: string
  public userVotingEscrowState: UserVotingEscrowState
  public userAdminState: UserAdminState
  public userRewardsManagerState: UserRewardsManagerState

  constructor(governanceClient: GovernanceClient, address: string) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.address = address
  }

  async loadState(userLocalStates: { [key: string]: {} }) {
    for (const [key, value] of Object.entries(userLocalStates)) {
      const appId = parseInt(key)
      // Case when we have the local state of the user with the admin contract
      if (appId == this.governanceClient.admin.adminAppId) {
        // Get storage account
        const storageAddress = parseAddressBytes(value[ADMIN_STRINGS.storage_account])
        // Get storage account local states
        const userStorageLocalStates = await getLocalStates(this.algod, storageAddress)
        this.userAdminState = new UserAdminState(storageAddress, userStorageLocalStates, this.governanceClient)
      }
      // Case when we have the local state of the user with the voting escrow contract
      if (appId == this.governanceClient.votingEscrow.appId) {
        this.userVotingEscrowState = new UserVotingEscrowState(value)
      }
      // Setting rewards manager
      if (appId == this.governanceClient.rewardsManager.appId) {
        this.userRewardsManagerState = new UserRewardsManagerState()
      }
    }
  }
}
