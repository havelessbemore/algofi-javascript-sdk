// IMPORTS

// external
import algosdk, { Algodv2, Transaction, encodeUint64, decodeUint64 } from "algosdk"

// global
import { FIXED_3_SCALE_FACTOR, TEXT_ENCODER, PERMISSIONLESS_SENDER_LOGIC_SIG } from "./../globals"
import { getLocalStates, getAccountBalances } from "./../stateUtils"
import { decodeBytes, parseAddressBytes } from "./../utils"

// local
import V1StakingClient from "./v1_stakingClient"
import V1StakingConfig, { V1StakingConfigs, V1_STAKING_STRINGS } from "./v1_stakingConfig"
import V1Staking from "./v1_staking"
import V1UserStakingState from "./v1_userStakingState"

// interface

export default class stakingUser {
  public algod: Algodv2
  public address: string
  public stakingClient: V1StakingClient

  public optedInStakingContracts: number[]
  public userStakingStates: { [key: number]: V1UserStakingState }

  constructor(stakingClient: V1StakingClient, address: string) {
    this.stakingClient = stakingClient
    this.algod = this.stakingClient.algod
    this.address = address
  }

  // get opted in staking contracts
  async loadState(userLocalStates: {}) {
    this.optedInStakingContracts = []
    this.userStakingStates = {}

    for (const [formattedAppId, userLocalState] of Object.entries(userLocalStates)) {
      const appId = parseInt(formattedAppId)
      if (appId in this.stakingClient.stakingContracts) {
        this.optedInStakingContracts.push(appId)
        let storageAddress = parseAddressBytes(userLocalState[V1_STAKING_STRINGS.user_storage_address])
        this.userStakingStates[appId] = new V1UserStakingState(
          this.algod,
          this.stakingClient.stakingContracts[appId],
          storageAddress
        )
        await this.userStakingStates[appId].loadState()
      }
    }
  }
}
