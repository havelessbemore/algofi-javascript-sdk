// IMPORTS

// external
import algosdk, {
  Algodv2,
  Indexer,
  encodeAddress,
  LogicSigAccount,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  decodeUint64,
  bytesToBigInt,
  OnApplicationComplete,
  SuggestedParams
} from "algosdk"

// local
import { getLocalStatesFromAccountInfo, getAccountBalancesFromAccountInfo, getAccountMinBalanceFromAccountInfo } from "./stateUtils"
import AlgofiClient from "./algofiClient"
import ParsedTransaction from "./parsedTransaction"

// lending
import BaseLendingUser from "./lending/baseLendingUser"

// staking
import BaseStakingUser from "./staking/baseStakingUser"

// governance
import BaseGovernanceUser from "./governance/baseGovernanceUser"

// ENUMS
export enum TxnLoadMode {
  REFRESH = 0,
  REVERSE = 1
}

// INTERFACE

export default class AlgofiUser {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public indexer: Indexer
  public address: string

  // account state
  public balances = {}
  public minBalance: number

  // transaction state
  public oldestLoadedRound: number
  public transactions: ParsedTransaction[]

  // protcol users
  public lending: BaseLendingUser

  public staking: BaseStakingUser

  public governance: BaseGovernanceUser

  /**
   * Constructor for the algofi client class.
   * 
   * @param algofiClient - algofi client
   * @param address - address for user
   */
  constructor(algofiClient: AlgofiClient, address: string) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.indexer = this.algofiClient.indexer
    this.address = address

    // lending
    this.lending = new BaseLendingUser(this.algofiClient, this.address)
    
    // staking
    this.staking = new BaseStakingUser(this.algofiClient, this.address)

    // governance
    this.governance = new BaseGovernanceUser(this.algofiClient, this.address)
  }

  /**
   * Function to load the states of all of the sub users on the algofi user
   * class.
   */
  async loadState() {
    // load user account info
    let accountInfo = await this.algod.accountInformation(this.address).do()

    // load local states
    let localStates = await getLocalStatesFromAccountInfo(accountInfo)

    // load balance state
    let balance = await getAccountBalancesFromAccountInfo(accountInfo)
    let minBalance = await getAccountMinBalanceFromAccountInfo(accountInfo)

    // update protocol user classes
    let loadLendingPromise = this.lending.loadState(localStates)

    // update user staking state
    let loadStakingPromise = this.staking.loadState(localStates)

    // update user governance state
    let loadGovernancePromise = this.governance.loadState(localStates)
    
    // await completion
    await Promise.all([loadLendingPromise, loadStakingPromise, loadGovernancePromise])
  }

  /**
   * Function to determine whether someone is opted into an asset or not.
   * 
   * @param assetId - asset id
   * @returns whether or not the user is opted into the asset id.
   */
  isOptedInToAsset(assetId: number): boolean {
    if (assetId in this.balances) {
      return true
    } else {
      return false
    }
  }

  async getTransactionHistory(mode : TxnLoadMode) {
    let accountTxns = {}
    let newParsedTxns: ParsedTransaction[] = []
    
    if (mode == TxnLoadMode.REFRESH) {
      // clear transactions
      this.transactions = []
    }

    if (mode == TxnLoadMode.REVERSE && this.transactions.length > 0) {
      accountTxns = await this.indexer
        .lookupAccountTransactions(this.address)
        .maxRound(this.transactions.slice(-1)[0].block)
        .limit(100)
        .do()
    } else {
      accountTxns = await this.indexer
        .lookupAccountTransactions(this.address)
        .limit(100)
        .do()
    }

    for (var txnIdx = 0; txnIdx < accountTxns["transactions"].length; txnIdx++) {
      const txn = accountTxns["transactions"][txnIdx]
      if (txn["tx-type"] == "appl") {
        if (this.algofiClient.lending.v2.isLendingTransaction(txn)) {
          this.lending.v2.parseTransaction(accountTxns["transactions"], txnIdx, this.transactions)
        }
      }
    }
  }
}
