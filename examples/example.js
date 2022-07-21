const algosdk = require("algosdk")
const algofi = require("../.")

//const m = "frame auto erosion drop weasel lecture health marine aisle stuff home harsh enough result market boost unknown carbon approve hello deputy what member abstract penalty"
//const a = "F44Y7B4O4DPUOXPZTHHJ36N7INEG7G4DC6XZ6CSDRORAQQW7YOE4KBZYPU"
//const a = "WO7ZA3GTZZTWEIU427ZZZ674RPYUUN5LOQJF5TBY2YYFBTTNOR33X45RYI"
const m = "chicken myth waste moral chuckle boil gossip cash gaze wreck devote give inhale because mango asthma relief grain power castle february level hazard about wish"
const a = "2NJEG3XKJZQ4PDSFXGIHOSTTY7Q7MBFZ76JQPMWNWV7O3LIB3T3JJYWLPE"
const decoded_a = algosdk.decodeAddress(a)
const sk = algosdk.mnemonicToSecretKey(m).sk

const userMnemonic = ""
const govUser = algosdk.mnemonicToSecretKey(userMnemonic)
const governanceStorgeAccountAddress = ""

const user2Mnemonic = ""
const govUser2 = algosdk.mnemonicToSecretKey(user2Mnemonic)
const governanceStorageAccountAddress2 = ""

async function executeTransactions(transactions, sk, client) {
  let stxns = []
  for (const txn of transactions) {
    stxns.push(algosdk.signTransaction(txn, sk).blob)
  }
  console.log("SEND TXNS")
  await client.sendRawTransaction(stxns).do()
}

NODE_URL = ""

async function test() {
  let client = new algosdk.Algodv2(
    "",
    NODE_URL,
    ""
  )
  let indexer = new algosdk.Indexer(
    "",
    "https://crimson-icy-meadow.algorand-mainnet.quiknode.pro/366f073317e2f6d87f525b328393e587ffb3628d/index", // MAINNET
    ""
  )
  console.log("TESTING")
  let a_client = new algofi.AlgofiClient(client, indexer, algofi.Network.MAINNET_CLONE2)
  await a_client.loadState()
  console.log("STATE LOADED")
  // Generate user object and load state
  let user = await a_client.getUser(a)
  //let algofiUser = await a_client.getUser(govUser.addr)
  //let algofiUser2 = await a_client.getUser(govUser2.addr)
  
  // fetch user transactions
  await user.getTransactionHistory(algofi.TxnLoadMode.REFRESH)
  console.log(user.transactions)

  // // GIANT OPT IN
  // // Generate a storage account for the user
  // const governanceStorageAccount = algosdk.generateAccount()
  // // Get opt in txns
  // const optInTxns = await a_client.governance.getOptInTxns(algofiUser2, governanceStorageAccount)
  // // Fund storage account
  // let stxn0 = algosdk.signTransaction(optInTxns[0], govUser2.sk)
  // // Storage account opt into admin
  // let stxn1 = algosdk.signTransaction(optInTxns[1], governanceStorageAccount.sk)
  // // Primary account opt into admin
  // let stxn2 = algosdk.signTransaction(optInTxns[2], govUser2.sk)
  // // Primary account into voting escrow
  // let stxn3 = algosdk.signTransaction(optInTxns[3], govUser2.sk)
  // // Primary account into rewards manager
  // let stxn4 = algosdk.signTransaction(optInTxns[4], govUser2.sk)
  // const stxns = [stxn0.blob, stxn1.blob, stxn2.blob, stxn3.blob, stxn4.blob]
  // console.log(governanceStorageAccount)
  // console.log("SEND OPTIN TXNS")
  // let srt = await client.sendRawTransaction(stxns).do()

  // // LOCK BANK TO GET VEBANK
  // const lockBankTxns = await a_client.governance.votingEscrow.getLockTxns(
  //   algofiUser2,
  //   1000000,
  //   a_client.governance.governanceConfig.votingEscrowMaxTimeLockSeconds - 1
  // )
  // await executeTransactions(lockBankTxns, govUser2.sk, client)
  // console.log(algofiUser2.governance.userVotingEscrowState)

  // // INCREASE LOCK AMOUNT
  // const increaseLockAmountTxns = await a_client.governance.votingEscrow.getIncreaseLockAmountTxns(
  //   algofiUser2,
  //   100000000
  // )
  // await executeTransactions(increaseLockAmountTxns, govUser2.sk, client)
  // console.log(algofiUser2.governance.userVotingEscrowState)

  // // CLAIM LOCKED BANK
  // const claimTxns = await a_client.governance.votingEscrow.getClaimTxns(algofiUser)
  // await executeTransactions(claimTxns, govUser.sk, client)
  // console.log(algofiUser.governance.userVotingEscrowState)

  // // EXTEND LOCK
  // const extendLockTxns = await a_client.governance.votingEscrow.getExtendLockTxns(algofiUser, 100)
  // await executeTransactions(extendLockTxns, govUser.sk, client)
  // console.log(algofiUser.governance.userVotingEscrowState)

  // // CREATE PROPOSAL
  // const createProposalTxns = await a_client.governance.admin.getCreateProposalTxns(
  //   algofiUser,
  //   "test_proposal",
  //   "test_proposal.com"
  // )
  // await executeTransactions(createProposalTxns, govUser.sk, client)
  // console.log(a_client.governance.admin.proposals)

  // // SET OPEN TO DELEGATION
  // const setOpenToDelegationTxns = await a_client.governance.admin.getSetOpenToDelegationTxns(algofiUser)
  // await executeTransactions(setOpenToDelegationTxns, govUser.sk, client)
  // console.log(algofiUser.governance.userAdminState)

  // // SET NOT OPEN TO DELEGATION
  // const setNotOpenToDelegationTxns = await a_client.governance.admin.getSetNotOpenToDelegationTxns(algofiUser)
  // await executeTransactions(setNotOpenToDelegationTxns, govUser.sk, client)
  // console.log(algofiUser.governance.userAdminState)

  // // VOTE
  // const proposal = a_client.governance.admin.proposals["814710912"]
  // const voteTxns = await a_client.governance.admin.getVoteTxns(algofiUser2, proposal, 1)
  // await executeTransactions(voteTxns, govUser2.sk, client)
  // const proposalAfter = a_client.governance.admin.proposals["814710912"]
  // console.log(proposalAfter)

  // // DELEGATE
  // // algofi user 2 delegating to algofi user
  // const delegateTxns = await a_client.governance.admin.getDelegateTxns(algofiUser2, algofiUser)
  // await executeTransactions(delegateTxns, govUser2.sk, client)
  // console.log(algofiUser.governance.userAdminState)
  // console.log(algofiUser2.governance.userAdminState)

  // // UNDELEGATE
  // const undelegateTxns = await a_client.governance.admin.getUndelegateTxns(algofiUser2)
  // await executeTransactions(undelegateTxns, govUser2.sk, client)
  // console.log(algofiUser2.governance.userAdminState)

  // // DELEGATED VOTE
  // // algofi user pushing algofi user 2 to vote the way they did on the same proposal
  // const proposal = a_client.governance.admin.proposals["814643870"]
  // const delegatedVoteTxns = await a_client.governance.admin.getDelegatedVoteTxns(algofiUser, algofiUser2, proposal)
  // await executeTransactions(delegatedVoteTxns, govUser.sk, client)
  // console.log(proposal.votesFor)

  // // VALIDATE
  // const proposal = a_client.governance.admin.proposals["814710912"]
  // const validateTxns = await a_client.governance.admin.getValidateTxns(algofiUser, proposal)
  // await executeTransactions(validateTxns, govUser.sk, client)
  // console.log(proposal)

  // // CLOSE OUT FROM PROPOSAL
  // const proposal = a_client.governance.admin.proposals["814710912"]
  // const closeOutFromProposalTxns = await a_client.governance.admin.getCloseOutFromProposalTxns(
  //   algofiUser,
  //   algofiUser2,
  //   proposal
  // )
  // await executeTransactions(closeOutFromProposalTxns, govUser.sk, client)
  // console.log(algofiUser2.governance.userAdminState)

  // let market = a_client.lending.markets[802881530]
  // let stxns = []
  // //console.log(user.lending)
  // let staking = a_client.v1Staking.stakingContracts[482625868]
  // //console.log(staking)
  // OPT IN TO STAKING CONTRACT
  //console.log("OPT IN")
  //let storageAccount = algosdk.generateAccount()
  //let optInTxns = await staking.getOptInTxns(user, storageAccount)
  //console.log("SIGN TXNS")
  //let stxn0 = algosdk.signTransaction(optInTxns[0], sk)
  //let stxn1 = algosdk.signTransaction(optInTxns[1], storageAccount.sk)
  //let stxn2 = algosdk.signTransaction(optInTxns[2], sk)
  //let stxn3 = algosdk.signTransaction(optInTxns[3], storageAccount.sk)
  //stxns = [stxn0.blob, stxn1.blob, stxn2.blob, stxn3.blob]
  //console.log("SEND TXNS")
  //let srt = await client.sendRawTransaction(stxns).do()

  // STAKE
  //console.log("STAKE")
  //let stakeTxns = await staking.getStakeTxns(user, 10000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of stakeTxns) {
  //  stxns.push(algosdk.signTransaction(txn, sk).blob)
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // UNSTAKE
  //console.log("UNSTAKE")
  //let unstakeTxns = await staking.getUnstakeTxns(user, 10000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of unstakeTxns) {
  //  stxns.push(algosdk.signTransaction(txn, sk).blob)
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // // CLAIM
  // console.log("CLAIM")
  // let claimTxns = await staking.getClaimTxns(user)
  // console.log("SIGN TXNS")
  // stxns = []
  // for (const txn of claimTxns) {
  //   stxns.push(algosdk.signTransaction(txn, sk).blob)
  // }
  // console.log("SEND TXNS")
  // await client.sendRawTransaction(stxns).do()

  // OPT IN TO MANAGER
  //console.log("OPT IN")
  //let storageAccount = algosdk.generateAccount()
  //let optInTxns = await a_client.lending.manager.getOptInTxns(user, storageAccount)
  //console.log("SIGN TXNS")
  //let stxn0 = algosdk.signTransaction(optInTxns[0], sk)
  //let stxn1 = algosdk.signTransaction(optInTxns[1], storageAccount.sk)
  //let stxn2 = algosdk.signTransaction(optInTxns[2], sk)
  //stxns = [stxn0.blob, stxn1.blob, stxn2.blob]
  //console.log("SEND TXNS")
  //let srt = await client.sendRawTransaction(stxns).do()

  // OPT IN TO MARKET
  //console.log("MARKET OPT IN")
  //let optInTxns = await a_client.lending.manager.getMarketOptInTxns(user, market)
  //console.log("SIGN TXNS")
  //let stxn0 = algosdk.signTransaction(optInTxns[0], sk)
  //let stxn1 = algosdk.signTransaction(optInTxns[1], sk)
  //let stxn2 = algosdk.signTransaction(optInTxns[2], sk)
  //stxns = [stxn0.blob, stxn1.blob, stxn2.blob]
  //console.log("SEND TXNS")
  //let srt = await client.sendRawTransaction(stxns).do()

  // OPT OUT OF MARKET
  //console.log("MARKET OPT OUT")
  //let optOutTxns = await a_client.lending.manager.getMarketOptOutTxns(user, market)
  //console.log("SIGN TXNS")
  //let stxn0 = algosdk.signTransaction(optOutTxns[0], sk)
  //stxns = [stxn0.blob]
  //console.log("SEND TXNS")
  //let srt = await client.sendRawTransaction(stxns).do()

  // MINT B ASSET
  //console.log("MINT")
  //let mintTxns = await market.getMintTxns(user, 100000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of mintTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // ADD B ASSET COLLATERAL
  //console.log("ADD B ASSET COLLATERAL")
  //let addBAssetCollateralTxns = await market.getAddBAssetCollateralTxns(user, 100000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of addBAssetCollateralTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // ADD UNDERLYING COLLATERAL
  //console.log("ADD UNDERLYING COLLATERAL")
  //let addUnderlyingCollateralTxns = await market.getAddUnderlyingCollateralTxns(user, 100000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of addUnderlyingCollateralTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // REMOVE UNDERLYING COLLATERAL
  //console.log("REMOVE UNDERLYING COLLATERAL")
  //let removeUnderlyingCollateralTxns = await market.getRemoveUnderlyingCollateralTxns(user, 21000000)
  //stxns = []
  //console.log("SIGN TXNS")
  //for (const txn of removeUnderlyingCollateralTxns) {
  //  console.log(txn)
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // REMOVE B ASSET COLLATERAL
  //console.log("REMOVE B ASSET COLLATERAL")
  //let removeBAssetCollateralTxns = await market.getRemoveBAssetCollateralTxns(user, 100000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of removeBAssetCollateralTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // BURN B ASSET
  //console.log("BURN B ASSET")
  //let burnTxns = await market.getBurnTxns(user, 100000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of burnTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // BORROW
  //console.log("BORROW")
  //let borrowTxns = await market.getBorrowTxns(user, 1000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of borrowTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // REPAY BORROW
  //console.log("REPAY BORROW")
  //let repayBorrowTxns = await market.getRepayBorrowTxns(user, 110000000, true)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of repayBorrowTxns) {
  //  console.log(txn)
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // CLAIM REWARDS
  //console.log("CLAIM REWARDS")
  //let claimRewardsTxns = await a_client.lending.getClaimRewardsTxns(user)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of claimRewardsTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // SYNC VAULT
  //console.log("SYNC VAULT")
  //let syncVaultTxns = await market.getSyncVaultTxns(user)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of syncVaultTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // SEND GOVERNANCE TXN
  //console.log("SEND GOV TXN")
  //let govTxns = await a_client.lending.manager.getGovernanceTxns(user, user.address, "testing")
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of govTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // SEND KEYREG
  //console.log("SEND KEYREG TXN")
  //let keyregTxns = await a_client.lending.manager.getKeyregTxns(user, user.address, "00000000000000000000000000000000", "00000000000000000000000000000000", "0000000000000000000000000000000000000000000000000000000000000000", 21833648, 21833648, 10000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of keyregTxns) {
  //  if (algofi.addressEquals(txn.from, decoded_a)) {
  //    stxns.push(algosdk.signTransaction(txn, sk).blob)
  //  } else {
  //    stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //  }
  //}
  //console.log("SEND TXNS")
  //await client.sendRawTransaction(stxns).do()

  // SEND KEYREG OFFLINE TXN
  //  console.log("SEND KEYREG OFFLINE TXN")
  //  let keyregOfflineTxns = await a_client.lending.manager.getKeyregOfflineTxns(user)
  //  console.log("SIGN TXNS")
  //  stxns = []
  //  for (const txn of keyregOfflineTxns) {
  //    if (algofi.addressEquals(txn.from, decoded_a)) {
  //      stxns.push(algosdk.signTransaction(txn, sk).blob)
  //    } else {
  //      stxns.push(algosdk.signLogicSigTransaction(txn, algofi.PERMISSIONLESS_SENDER_LOGIC_SIG.lsig).blob)
  //    }
  //  }
  //  console.log("SEND TXNS")
  //  await client.sendRawTransaction(stxns).do()
}

test()
