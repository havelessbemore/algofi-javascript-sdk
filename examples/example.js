const algosdk = require("algosdk")
const algofi = require("../.")

//const m = "frame auto erosion drop weasel lecture health marine aisle stuff home harsh enough result market boost unknown carbon approve hello deputy what member abstract penalty"
//const a = "F44Y7B4O4DPUOXPZTHHJ36N7INEG7G4DC6XZ6CSDRORAQQW7YOE4KBZYPU"
//const decoded_a = algosdk.decodeAddress(a)
//const sk = algosdk.mnemonicToSecretKey(m).sk

//const m = "gauge imitate timber often cabbage system picture jacket climb helmet print shed summer learn dawn suspect dial tide muscle gloom luggage remain govern abandon abuse"
//const a = "HFQOFEYZ4GUKAQUIIQOCOXLAFDVOZYPKI4POKKGNCBGOBZ3RJZZFERCHRU"
//const decoded_a = algosdk.decodeAddress(a)
//const sk = algosdk.mnemonicToSecretKey(m).sk

//const m = "manage jar lobster fresh fringe note candy major denial economy fat bring chat antenna pause sure intact dove false barrel roof meat shrug ability mouse"
//const a = "QHYOLZC4SLE7IX5VYQPMYGP2DNQQUNPI4SV6DIBZKCK7NH6FAOOPWOOZJQ"
//const decoded_a = algosdk.decodeAddress(a)
//const sk = algosdk.mnemonicToSecretKey(m).sk

//const m = "mask stick odor boil flock hidden upgrade guide topple raw soft victory repeat gas art resemble around negative buyer long bundle develop security above grocery"
//const a = "TLRK7PXYX2ROK7ZBVRXDUCUGR4QCYCEUWZZ7LRXNRUEPI7RPSZBG5BQEB4"
//const decoded_a = algosdk.decodeAddress(a)
//const sk = algosdk.mnemonicToSecretKey(m).sk

const user1Passphrase = "pause speak gaze term indoor length rifle valid slow property smooth goddess guess globe note seat excuse blur until dry city repeat dream absent today"
const user1Address = "CZGVJLFMYYIE43VZ4WBQYSZRXHK2XBAVGROLWD7Q26RRBJHFNXQ5IQBVFI"
const decodedAddress1 = algosdk.decodeAddress(user1Address)
const user1sk = algosdk.mnemonicToSecretKey(user1Passphrase).sk

const user2Passphrase = "wait rice future small castle argue job ranch budget normal dry jungle canvas velvet inflict coach become maze tail dizzy dinner fence virtual about gather"
const user2Address = "OSMXTEDET334KWYKHRX3WQMJQPNEPDSP7NXOU4AOYHVTEUQBREASNQILCY"
const decodedAddress2 = algosdk.decodeAddress(user2Address)
const user2sk = algosdk.mnemonicToSecretKey(user2Passphrase).sk

async function test() {
  let client = new algosdk.Algodv2("", "https://node.algoexplorerapi.io", "")
	let a_client = new algofi.AlgofiClient(client, algofi.Network.MAINNET)
	await a_client.loadState()

	let user = await a_client.getUser(user1Address)
	let staking = a_client.staking.stakingContracts[785597550]


	// OPT IN TO STAKING CONTRACT
//	console.log("OPT IN STAKING CONTRACT")
//	let optInTxns = await staking.getUserOptInTxns(user)
//	console.log("SIGN TXNS")
//	let stxn0 = algosdk.signTransaction(optInTxns[0], user1sk)
//	stxns = [stxn0.blob]
//	console.log("SEND TXNS")
//	let srt = await client.sendRawTransaction(stxns).do()

	// STAKE
//	console.log("STAKE")
//	let stakeTxns = await staking.getStakeTxns(user, 10000)
//	console.log("SIGN TXNS")
//	let stxn0 = algosdk.signTransaction(stakeTxns[0], user1sk)
//	let stxn1 = algosdk.signTransaction(stakeTxns[1], user1sk)
//	stxns = [stxn0.blob, stxn1.blob]
//	console.log("SEND TXNS")
//	let srt = await client.sendRawTransaction(stxns).do()

	// UNSTAKE 
//	console.log("UNSTAKE")
//	let unstakeTxns = await staking.getUnstakeTxns(user, 1000)
//	console.log("SIGN TXNS")
//	let stxn0 = algosdk.signTransaction(unstakeTxns[0], user1sk)
//	stxns = [stxn0.blob]
//	console.log("SEND TXNS")
//	let srt = await client.sendRawTransaction(stxns).do()

	// CLAIM
	console.log("CLAIM")
	let claimTxns = await staking.getClaimTxns(user)
	console.log("SIGN TXNS")
	let stxns = []
	if (claimTxns.length == 0) {
		console.log("nothing to claim!")
	}
	else {
		for (let i = 0; i < claimTxns.length; ++i) {
			let stxn = algosdk.signTransaction(claimTxns[i], user1sk)
			stxns.push(stxn.blob)
		}
		console.log("SEND TXNS")
		let srt = await client.sendRawTransaction(stxns).do()
	}
  
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
  //let removeUnderlyingCollateralTxns = await market.getRemoveUnderlyingCollateralTxns(user, 100000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of removeUnderlyingCollateralTxns) {
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
  //let borrowTxns = await market.getBorrowTxns(user, 100000000)
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
  //let repayBorrowTxns = await market.getRepayBorrowTxns(user, 100000000)
  //console.log("SIGN TXNS")
  //stxns = []
  //for (const txn of repayBorrowTxns) {
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
