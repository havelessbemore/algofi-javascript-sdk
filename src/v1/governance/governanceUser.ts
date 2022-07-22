// IMPORTS

// external
import { Algodv2 } from "algosdk"

// global
import { getLocalStates } from "../stateUtils"
import { parseAddressBytes } from "../utils"

// local
import GovernanceClient from "./governanceClient"
import { ADMIN_STRINGS } from "./governanceConfig"
import UserAdminState from "./userAdminState"
import UserRewardsManagerState from "./userRewardsManagerState"
import UserVotingEscrowState from "./userVotingEscrowState"

export default class governanceUser {
  public governanceClient: GovernanceClient
  public algod: Algodv2
  public address: string
  public userVotingEscrowState: UserVotingEscrowState
  public userAdminState: UserAdminState
  public userRewardsManagerState: UserRewardsManagerState

  /**
   * Constructor for the governance user class.
   * 
   * @param governanceClient - a governance client
   * @param address - address of the user
   */
  constructor(governanceClient: GovernanceClient, address: string) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.address = address
  }

  /**
   * A function which will load in all of the state for a governance user
   * including their admin state, voting escrow state, and rewards manager
   * state into the governance user object.
   * 
   * @param userLocalStates - a list of all of the local states for the
   * particular user with the admin, voting escrow, and rewards manager
   * contracts.
   */
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
