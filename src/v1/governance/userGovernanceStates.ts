import Proposal from "./proposal"

export class UserVotingEscrowState {
  public amountLocked: number
  public lockStartTime: number
  public lockDuration: number
  public amountVeBank: number
  public boostMultiplier: number
  constructor() {}
}

export class UserAdminState {
  public storageAddress: string
  public openToDelegation: number
  public delegatorCount: number
  public delegatingTo: string
  public userProposalStates: { [key: number]: UserProposalState }
  constructor() {}
}

export class UserRewardsManagerState {}

export class UserProposalState {
  public forOrAgainst
  public votingAmount
  constructor() {}
}
