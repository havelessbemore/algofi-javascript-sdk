// IMPORTS

// external
import algosdk, { Algodv2, Transaction, encodeUint64, decodeUint64 } from "algosdk"

// global
import { FIXED_3_SCALE_FACTOR, TEXT_ENCODER, PERMISSIONLESS_SENDER_LOGIC_SIG } from "../../globals"
import { getLocalStates, getAccountBalances } from "../../stateUtils"
import { decodeBytes, parseAddressBytes } from "../../utils"

// local
import StakingClient from "./stakingClient"
import StakingConfig, { StakingConfigs, STAKING_STRINGS } from "./stakingConfig"
import Staking from "./staking"
import UserStakingState from "./userStakingState"

// interface

export default class StakingUser {
	public algod: Algodv2
  public address: string
  public stakingClient: StakingClient

  public optedInStakingContracts: number[]
  public userStakingStates: { [key: number]: UserStakingState }

  constructor(stakingClient: StakingClient, address: string) {
		this.stakingClient = stakingClient
    this.algod = this.stakingClient.algod
    this.address = address
  }

  // get opted in staking contracts
  /**
   * Function to take the local states of a user and update the data on the
   * object.
   * 
   * @param userLocalStates - collection of all of the local states for the user
   */
  async loadState(userLocalStates: {}) {
    this.optedInStakingContracts = []
    this.userStakingStates = {}

    for (const [formattedAppId, userLocalState] of Object.entries(userLocalStates)) {
      const appId = parseInt(formattedAppId)
      if (appId in this.stakingClient.stakingContracts) {
        this.optedInStakingContracts.push(appId)
        let storageAddress = parseAddressBytes(userLocalState[STAKING_STRINGS.user_storage_address])
        this.userStakingStates[appId] = new UserStakingState(
          this.algod,
          this.stakingClient.stakingContracts[appId],
          storageAddress
        )
        await this.userStakingStates[appId].loadState()
      }
    }
  }
}
