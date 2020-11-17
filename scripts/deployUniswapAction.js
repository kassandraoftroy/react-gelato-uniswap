const ethers = require('ethers');
const hre = require('hardhat');
require('dotenv').config();

const deployUniswapAction = async wallet => {
  let tokenConv = hre.network.config.deployments.TokenConversion;
  if (hre.network.config.deployments.TokenConversion == '') {
    const artifact = hre.artifacts.readArtifactSync('TokenConversion');
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      wallet,
    );
    const deployTx = factory.getDeployTransaction(
      hre.network.config.addressBook.erc20.WETH,
    );
    deployTx.gasLimit = 6000000;
    deployTx.gasPrice = ethers.utils.parseUnits('10', 'gwei');
    try {
      const tx = await wallet.sendTransaction(deployTx);
      let receipt;
      console.log('\n Waiting for deploy TokenConversion TX to get mined...');
      console.log(' tx:', tx.hash);
      while (true) {
        receipt = await wallet.provider.getTransactionReceipt(tx.hash);
        if (receipt != null) {
          break;
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      console.log(' Deploy TokenConversion TX successfully mined ✅');
      console.log(' contract:', receipt.contractAddress);
      tokenConv = receipt.contractAddress;
      const contract = new ethers.Contract(
        receipt.contractAddress,
        artifact.abi,
        wallet,
      );
      const tx2 = await contract.functions.addOracle(
        hre.network.config.addressBook.erc20.DAI,
        hre.network.config.addressBook.oracles.DaiEth,
      );
      console.log(' adding oracle:', tx2.hash);
    } catch (e) {
      console.log('error deploying contract:', e.message);
    }
  }
  if (hre.network.config.deployments.TestAction == '') {
    try {
      const artifact2 = hre.artifacts.readArtifactSync('TestAction');
      const factory2 = new ethers.ContractFactory(
        artifact2.abi,
        artifact2.bytecode,
        wallet,
      );
      const deployTx2 = factory2.getDeployTransaction();
      deployTx2.gasLimit = 6000000;
      deployTx2.gasPrice = ethers.utils.parseUnits('10', 'gwei');
      const tx = await wallet.sendTransaction(deployTx2);
      let receipt;
      console.log('\n Waiting for deploy TestAction TX to get mined...');
      console.log(' tx:', tx.hash);
      while (true) {
        receipt = await wallet.provider.getTransactionReceipt(tx.hash);
        if (receipt != null) {
          break;
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      console.log(' Deploy TestAction TX successfully mined ✅');
      console.log(' contract:', receipt.contractAddress);
    } catch (e) {
      console.log('error deploying test contract:', e.message);
    }
  }
  if (hre.network.config.deployments.ActionSafeUniswap == '') {
    try {
      const artifact3 = hre.artifacts.readArtifactSync('ActionSafeUniswap');
      const factory3 = new ethers.ContractFactory(
        artifact3.abi,
        artifact3.bytecode,
        wallet,
      );
      const deployTx3 = factory3.getDeployTransaction(
        hre.network.config.addressBook.uniswapV2.router2,
        tokenConv,
        1,
      );
      deployTx3.gasLimit = 6000000;
      deployTx3.gasPrice = ethers.utils.parseUnits('10', 'gwei');
      const tx = await wallet.sendTransaction(deployTx3);
      let receipt;
      console.log('\n Waiting for deploy ActionSafeUniswap TX to get mined...');
      console.log(' tx:', tx.hash);
      while (true) {
        receipt = await wallet.provider.getTransactionReceipt(tx.hash);
        if (receipt != null) {
          break;
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      console.log(' Deploy ActionSafeUniswap TX successfully mined ✅');
      console.log(' contract:', receipt.contractAddress);
    } catch (e) {
      console.log('error deploying test contract:', e.message);
    }
  }
};

(async () => {
  const priv = hre.network.config.accounts[0];
  const providerURL = hre.network.config.url;
  const provider = new ethers.providers.JsonRpcProvider(providerURL);
  const wallet = new ethers.Wallet(priv, provider);
  await deployUniswapAction(wallet);
})();
