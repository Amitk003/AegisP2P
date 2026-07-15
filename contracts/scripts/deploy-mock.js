const hre = require("hardhat");

async function main() {
  console.log("Deploying MockReclaim verifier...");
  console.log("Network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const escrowAddress = process.env.ESCROW_CONTRACT_ADDRESS;
  if (!escrowAddress) {
    console.error("Set ESCROW_CONTRACT_ADDRESS in .env pointing to your deployed AegisEscrow");
    process.exit(1);
  }

  const MockReclaim = await hre.ethers.getContractFactory("MockReclaim");
  const mock = await MockReclaim.deploy();
  await mock.waitForDeployment();

  const mockAddr = await mock.getAddress();
  console.log("MockReclaim deployed to:", mockAddr);

  const escrow = await hre.ethers.getContractAt("AegisEscrow", escrowAddress);
  const tx = await escrow.setReclaimVerifier(mockAddr);
  await tx.wait();
  console.log("setReclaimVerifier called successfully");

  console.log("--- Summary ---");
  console.log("MockReclaim:", mockAddr);
  console.log("AegisEscrow:", escrowAddress);
  console.log("Tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
