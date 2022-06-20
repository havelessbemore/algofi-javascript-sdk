import { STAKING_STRINGS } from "./stakingConfig"

export default class RewardsProgramState{
	rewardsProgramIndex: number
	rewardsProgramCounter: number
	rewardsAssetId: number
	rewardsPerSecond: number
	rewardsCoefficient: number
	rewardsIssued: number
	rewardsPayed: number

	// pass in formatted staking state and extract based on index
	constructor(stakingState: {}, rewardsProgramIndex: number) {
		this.rewardsProgramIndex = rewardsProgramIndex
		this.rewardsProgramCounter = stakingState[STAKING_STRINGS.rewards_program_counter_prefix + this.rewardsProgramIndex.toString()] || 0
	}
}

