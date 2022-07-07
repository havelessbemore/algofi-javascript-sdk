// IMPORTS

// external
import algosdk, { Algodv2, Transaction, encodeUint64, decodeUint64 } from "algosdk"

// global
import { FIXED_3_SCALE_FACTOR, TEXT_ENCODER, PERMISSIONLESS_SENDER_LOGIC_SIG } from "./../globals"
import { getLocalStates, getAccountBalances, getAccountMinBalance } from "./../stateUtils"
import { getParams } from "./../transactionUtils"
import { decodeBytes, parseAddressBytes } from "./../utils"

// local
import { MANAGER_STRINGS, MARKET_STRINGS } from "./lendingConfig"
import LendingClient from "./lendingClient"
import Market from "./market"
import UserMarketState from "./userMarketState"

// interface

export default class User {
  public algod: Algodv2
  public address: string
  public storageAddress: string
  public lendingClient: LendingClient

  public storageBalances = {}
  public storageMinBalance: number

  public optedInToManager = false
  public optedInMarkets = []
  public userMarketStates: { [key: number]: UserMarketState } = {}

  // net values
  public netSupplied: number
  public netScaledCollateral: number
  public netSupplyAPR: number
  public netBorrowed: number
  public netScaledBorrow: number
  public netBorrowAPR: number

  constructor(lendingClient: LendingClient, address: string) {
    this.lendingClient = lendingClient
    this.algod = this.lendingClient.algod
    this.address = address
  }

  async loadState(userLocalStates: {}) {
    // parse user state
    if (this.lendingClient.manager.appId in userLocalStates) {
      this.optedInToManager = true
      this.storageAddress = parseAddressBytes(
        userLocalStates[this.lendingClient.manager.appId][MANAGER_STRINGS.storage_account]
      )

      // reset state
      this.optedInMarkets = []
      this.userMarketStates = {}

      // load storage balances
      this.storageBalances = await getAccountBalances(this.algod, this.storageAddress)
      this.storageMinBalance = await getAccountMinBalance(this.algod, this.storageAddress)

      // load storage state
      let storageLocalStates = await getLocalStates(this.algod, this.storageAddress)

      // load manager state
      let managerState = storageLocalStates[this.lendingClient.manager.appId]
      for (var i = 0; i < 7; ++i) {
        let pageKey = MANAGER_STRINGS.opted_in_markets_page_prefix + String.fromCharCode.apply(null, encodeUint64(i))
        if (pageKey in managerState) {
          let pageBytes = Buffer.from(managerState[pageKey], "base64").toString("binary")
          let pageItems = Math.floor(pageBytes.length / 8)
          for (var j = 0; j < pageItems; ++j) {
            this.optedInMarkets.push(decodeUint64(decodeBytes(pageBytes.substr(j * 8, 8)), "safe"))
          }
        }
      }

      // load market states
      await Promise.all(
        this.optedInMarkets.map(async marketAppId => {
          this.userMarketStates[marketAppId] = new UserMarketState(
            storageLocalStates[marketAppId],
            this.lendingClient.markets[marketAppId]
          )
        })
      )

      // calc net values
      this.netSupplied = 0
      this.netScaledCollateral = 0
      this.netBorrowed = 0
      this.netScaledBorrow = 0
      let dollarTotaledSupplyAPR = 0
      let dollarTotaledBorrowAPR = 0
      for (const [key, value] of Object.entries(this.userMarketStates)) {
        let market = this.lendingClient.markets[key]
        this.netSupplied += value.suppliedAmount.usd
        this.netBorrowed += value.borrowedAmount.usd
        this.netScaledCollateral += (value.suppliedAmount.usd * market.collateralFactor) / FIXED_3_SCALE_FACTOR
        this.netScaledBorrow += (value.borrowedAmount.usd * market.borrowFactor) / FIXED_3_SCALE_FACTOR
        dollarTotaledSupplyAPR += value.suppliedAmount.usd * market.supplyAPR
        dollarTotaledBorrowAPR += value.borrowedAmount.usd * market.borrowAPR
      }
      this.netSupplyAPR = dollarTotaledSupplyAPR / this.netSupplied
      this.netBorrowAPR = dollarTotaledBorrowAPR / this.netBorrowed
    } else {
      this.optedInToManager = false
    }
  }

  isUserOptedIntoMarket(marketAppId: number): boolean {
    return marketAppId in this.userMarketStates
  }

  getMarketPageOffset(marketAppId: number): [number, number] {
    let marketIndex = this.optedInMarkets.indexOf(marketAppId)
    let page = Math.floor(marketIndex / 3)
    let offset = marketIndex % 3
    return [page, offset]
  }

  async getCalcUserPositionTransactions(targetMarketAppId: number): Promise<Transaction[]> {
    let transactions: Transaction[] = []

    const params = await getParams(this.algod)
    params.fee = 0

    let pageCount = Math.ceil(this.optedInMarkets.length / 3)
    for (var page = 0; page < pageCount; ++page) {
      let marketsOnPage = (page + 1) * 3 <= this.optedInMarkets.length ? 3 : this.optedInMarkets.length % 3

      let foreignApps = []
      for (var offset = 0; offset < marketsOnPage; ++offset) {
        let market = this.lendingClient.markets[this.optedInMarkets[page * 3 + offset]]
        foreignApps.push(market.appId)
        foreignApps.push(market.oracle.appId)
      }

      let txn = algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.lendingClient.manager.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(MANAGER_STRINGS.calculate_user_position),
          encodeUint64(page),
          encodeUint64(targetMarketAppId)
        ],
        accounts: [this.storageAddress],
        foreignApps: foreignApps,
        foreignAssets: undefined,
        rekeyTo: undefined
      })

      transactions.push(txn)
    }

    return transactions
  }
}
