import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const hre = await import("hardhat");
  const network = hre.default.network;
  const conn = await network.connect();
  const ethers = conn.ethers;

  console.log("═══════════════════════════════════════");
  console.log("  MedChain — Deploy MedicalRecord");
  console.log("═══════════════════════════════════════");
  console.log(`\nNetwork  : ${conn.networkName}`);

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer : ${deployer.address}`);
  console.log(`Balance  : ${ethers.formatEther(balance)} MATIC`);

  if (balance === 0n) {
    console.error("\nBalance 0! Isi MATIC testnet dulu.");
    console.error("   Faucet: https://faucet.polygon.technology");
    process.exit(1);
  }

  console.log("\nDeploying MedicalRecord...");
  const Factory = await ethers.getContractFactory("MedicalRecord");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  const networkName = conn.networkName;

  console.log("\nDeploy berhasil!");
  console.log(`   Address : ${contractAddress}`);
  console.log(`   Tx Hash : ${deployTx?.hash}`);

  // Simpan hasil deploy
  const outputDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, `${networkName}.json`),
    JSON.stringify({
      network: networkName,
      contractAddress,
      txHash: deployTx?.hash,
      deployedAt: new Date().toISOString(),
    }, null, 2)
  );
  console.log(`\nDisimpan ke deployments/${networkName}.json`);

  // Copy ABI ke backend
  const abiSrc = path.join(__dirname, "../artifacts/contracts/MedicalRecord.sol/MedicalRecord.json");
  const abiDst = path.join(__dirname, "../../medchain-backend/contracts");
  if (fs.existsSync(abiSrc)) {
    if (!fs.existsSync(abiDst)) fs.mkdirSync(abiDst, { recursive: true });
    fs.copyFileSync(abiSrc, path.join(abiDst, "MedicalRecord.json"));
    console.log("ABI disalin ke medchain-backend/contracts/");
  }

  console.log(`\nTambahkan ke .env backend:`);
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
