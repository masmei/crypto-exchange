async function main() {
  console.log("Preparing deployment...\n")

  //Fetch contact to deploy
  const Token = await ethers.getContractFactory("Token");
  const Exchange = await ethers.getContractFactory("Exchange");

  //Fetch accounts
  const accounts = await ethers.getSigners()
  console.log(`Accounts fetched: \n${accounts[0].address}\n${accounts[1].address}\n`)

  //Deploy contract
  const monie = await Token.deploy("MONIE", "MONIE", "1000000")
  await monie.deployed()
  console.log(`MONIE Token deployed to ${monie.address}`)

  const mDai = await Token.deploy("mDAI", "mDAI", "1000000")
  await mDai.deployed()
  console.log(`mDAI Token deployed to ${mDai.address}`)

  const mEth = await Token.deploy("mETH", "mETH", "1000000")
  await mEth.deployed()
  console.log(`mETH Token deployed to ${mEth.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 5)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

