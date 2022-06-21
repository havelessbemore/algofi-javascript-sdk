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
import StakingConfig, { StakingConfigs, rewardsManagerAppId } from "./stakingConfig"
import Staking from "./staking"
import UserStakingState from "./userStakingState"

// local
import StakingClient from "./stakingClient"

// interface

export default class stakingUser {
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
	async loadState() { 
		const userLocalStates = await getLocalStates(this.algod, this.address)
		const allStakingContracts = StakingConfigs[this.stakingClient.network].map((stakingConfig) => stakingConfig.appId)

		// getting the opted in staking contracts
		this.optedInStakingContracts = []
		this.userStakingStates = {}
		for (const [key, value] of Object.entries(userLocalStates)) {
			const appId = parseInt(key)
			if (allStakingContracts.includes(appId)) {

				// instantiate dummy staking config
				let stakingConfig = StakingConfigs[this.stakingClient.network].filter(stakingConfig => stakingConfig.appId === appId)[0]

				// instantiate a staking contract (to get global state)
				const staking = new Staking(this.algod, this.stakingClient, rewardsManagerAppId[this.stakingClient.network], stakingConfig)

				// so we can get the global state
				await staking.loadState()

//				// set for the key the following 
//				this.userStakingStates[appId] = new UserStakingState(value, staking)
//				
//				// first push this to the opted in staking contracts
//				this.optedInStakingContracts.push(appId)
			}
		}
	}
}
