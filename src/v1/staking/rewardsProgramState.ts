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
		this.rewardsAssetId = stakingState[STAKING_STRINGS.rewards_asset_id_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsPerSecond = stakingState[STAKING_STRINGS.rewards_per_second_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsCoefficient = stakingState[STAKING_STRINGS.rewards_coefficient_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsIssued = stakingState[STAKING_STRINGS.rewards_issued_prefix + this.rewardsProgramIndex.toString()] || 0
		this.rewardsPayed = stakingState[STAKING_STRINGS.rewards_payed_prefix + this.rewardsProgramIndex.toString()] || 0
	}
}

