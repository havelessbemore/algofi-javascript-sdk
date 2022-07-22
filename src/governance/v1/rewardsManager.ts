// IMPORTS

// external
import { Algodv2 } from "algosdk"

// local
import GovernanceClient from "./governanceClient"
import GovernanceConfig from "./governanceConfig"

export default class RewardsManager {
  public governanceClient: GovernanceClient
  public algod: Algodv2
  public appId: number

  /**
   * Constructor for the rewardsManager object.
   * 
   * @param governanceClient - governance client
   * @param governanceConfig - governance config
   */
  constructor(governanceClient: GovernanceClient, governanceConfig: GovernanceConfig) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.appId = governanceConfig.rewardsManagerAppId
  }
}
