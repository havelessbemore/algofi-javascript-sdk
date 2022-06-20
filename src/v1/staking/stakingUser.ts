// IMPORTS

// external
import algosdk, {
	Algodv2,
  Transaction,
  encodeUint64,
  decodeUint64,
} from "algosdk"

// global
import { FIXED_3_SCALE_FACTOR, TEXT_ENCODER, PERMISSIONLESS_SENDER_LOGIC_SIG } from "./../globals"
import { getLocalStates, getAccountBalances } from "./../stateUtils"
import { decodeBytes, parseAddressBytes } from "./../utils"
import UserStakingState from "./userStakingState"

// local
import StakingClient from "./stakingClient"

// interface

export default class stakingUser {
  public algod: Algodv2
  public address: string
	public stakingClient: StakingClient
  
  public optedInStakingContracts = []
  public userStakingStates: { [key: number]: UserStakingState } = {}

  constructor(stakingClient: StakingClient, address: string) {
    this.stakingClient = stakingClient
    this.algod = this.stakingClient.algod
    this.address = address
  }
  
  async loadState(userLocalStates): Promise<{}> {
		return {}
	}
  
}
