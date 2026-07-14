const hre = require("hardhat");

async function main() {
  console.log("Deploying AegisEscrow...");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "MON");

  const AegisEscrow = await hre.ethers.getContractFactory("AegisEscrow");
  const escrow = await AegisEscrow.deploy();
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  const txHash = escrow.deploymentTransaction()?.hash ?? "unknown";

  console.log("AegisEscrow deployed to:", address);
  console.log("Transaction hash:", txHash);

  const reclaimVerifier = process.env.RECLAIM_VERIFIER_ADDRESS;
  if (reclaimVerifier) {
    console.log("Setting Reclaim verifier to:", reclaimVerifier);
    const tx = await escrow.setReclaimVerifier(reclaimVerifier);
    await tx.wait();
    console.log("Reclaim verifier set successfully");
  } else {
    console.log("No RECLAIM_VERIFIER_ADDRESS set. Skipping verifier setup.");
    console.log("Set it later via contract owner using setReclaimVerifier()");
  }

  console.log("--- Deployment Summary ---");
  console.log("Contract: AegisEscrow");
  console.log("Network:", hre.network.name);
  console.log("Address:", address);
  console.log("Deployer:", deployer.address);
  console.log("Tx Hash:", txHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
