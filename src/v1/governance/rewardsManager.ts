// IMPORTS

// external
import { Algodv2 } from "algosdk"

// local
import GovernanceClient from "./governanceClient"
import GovernanceConfig from "./governanceConfig"

export default class RewardsManager {
  public govClient: GovernanceClient
  public algod: Algodv2
  public appId: number

  constructor(govClient: GovernanceClient, governanceConfig: GovernanceConfig) {
    this.govClient = govClient
    this.algod = this.govClient.algod
    this.appId = governanceConfig.rewardsManagerAppId
  }
}
