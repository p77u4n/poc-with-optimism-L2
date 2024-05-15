import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Controller, GeneNFT, PostCovidStrokePrevention } from "../typechain-types";

/**
 * Deploys a contract named "BuyMeACoffee" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployController: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const nftContract = await hre.ethers.getContract<GeneNFT>("GeneNFT", deployer);
  const pcspTokenContract = await hre.ethers.getContract<PostCovidStrokePrevention>(
    "PostCovidStrokePrevention",
    deployer,
  );
  await deploy("Controller", {
    from: deployer,
    // Contract constructor arguments
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    args: [nftContract.target, pcspTokenContract.target],
  });

  // Get the deployed contract to interact with it after deploying.
  const contract = await hre.ethers.getContract<Controller>("Controller", deployer);
  await nftContract.transferOwnership(contract.target);
  await pcspTokenContract.transferOwnership(contract.target);
  console.log("👋 Controller online!", contract.target);
};

export default deployController;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags BuyMeACoffee
deployController.tags = ["Controller"];
