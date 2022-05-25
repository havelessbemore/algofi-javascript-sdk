// IMPORTS

// external
import algosdk, {
  Algodv2,
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
import { getLocalStates, getAccountBalances } from "./stateUtils"
import AlgofiClient from "./algofiClient"

// lending
import LendingUser from "./lending/lendingUser"

// INTERFACE

export default class AlgofiUser {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public address: string
  
  // state
  public balances = {}
  
  // protcol users
  public lending: LendingUser
  
  constructor(algofiClient: AlgofiClient, address: string) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.address = address
    
    // lending
    this.lending = this.algofiClient.lending.getUser(this.address)
  }
  
  async loadState() {
    // load balance state
    this.balances = await getAccountBalances(this.algod, this.address)
    
    // load local states
    let localStates = await getLocalStates(this.algod, this.address)

    // update protocol user classes
    await this.lending.loadState(localStates)
    
  }
  
  isOptedInToAsset(assetId: number) : boolean {
    if (assetId in this.balances) {
      return true
    } else {
      return false
    }
  }
  
}