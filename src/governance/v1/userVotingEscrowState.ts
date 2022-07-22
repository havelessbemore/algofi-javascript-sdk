// IMPORTS

// local
import { VOTING_ESCROW_STRINGS } from "./governanceConfig"

export default class UserVotingEscrowState {
  public amountLocked: number
  public lockStartTime: number
  public lockDuration: number
  public amountVeBank: number
  public boostMultiplier: number

  /**
   * Constructor for the user voting escrow class.
   * 
   * @param userLocalState - a dictionary representing a user's local state with
   * the voting escrow contract.
   */
  constructor(userLocalState: {}) {
    this.amountLocked = userLocalState[VOTING_ESCROW_STRINGS.user_amount_locked]
    this.lockStartTime = userLocalState[VOTING_ESCROW_STRINGS.user_lock_start_time]
    this.lockDuration = userLocalState[VOTING_ESCROW_STRINGS.user_lock_duration]
    this.amountVeBank = userLocalState[VOTING_ESCROW_STRINGS.user_amount_vebank]
    this.boostMultiplier = userLocalState[VOTING_ESCROW_STRINGS.user_boost_multiplier]
  }
}
