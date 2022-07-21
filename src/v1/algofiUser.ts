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
import { getLocalStates, getAccountBalances, getAccountMinBalance } from "./stateUtils"
import AlgofiClient from "./algofiClient"
import ParsedTransaction from "./parsedTransaction"

// lending
import LendingUser from "./lending/lendingUser"

// staking
import StakingUser from "./staking/stakingUser"

// v1Staking
import V1StakingUser from "./v1_staking/v1_stakingUser"

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
  public lending: LendingUser

  public staking: StakingUser
  
  public v1Staking: V1StakingUser

  constructor(algofiClient: AlgofiClient, address: string) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.indexer = this.algofiClient.indexer
    this.address = address

    // lending
    this.lending = this.algofiClient.lending.getUser(this.address)

    // staking
    this.staking = this.algofiClient.staking.getUser(this.address)
    
    // v1staking
    this.v1Staking = this.algofiClient.v1Staking.getUser(this.address)
  }

  async loadState() {
    // load balance state
    this.balances = await getAccountBalances(this.algod, this.address)
    this.minBalance = await getAccountMinBalance(this.algod, this.address)

    // load local states
    let localStates = await getLocalStates(this.algod, this.address)

    // update protocol user classes
    await this.lending.loadState(localStates)

    // update user staking state
    await this.staking.loadState(localStates)
    
    // update user v1 staking state
    await this.v1Staking.loadState(localStates)
  }

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
        if (this.algofiClient.lending.isLendingTransaction(txn)) {
          this.lending.parseTransaction(accountTxns["transactions"], txnIdx, this.transactions)
        }
      }
    }
  }
}
