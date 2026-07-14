const hre = require("hardhat");

async function main() {
  const AegisEscrow = await hre.ethers.getContractFactory("AegisEscrow");
  const escrow = await AegisEscrow.deploy();
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();
  console.log("AegisEscrow deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
