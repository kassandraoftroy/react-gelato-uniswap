const ethers = require('ethers');
const hre = require('hardhat');
require('dotenv').config();

const encodeWithSelector = (abi, functionname, inputs) => {
  const iface = new ethers.utils.Interface(abi);
  return iface.encodeFunctionData(functionname, inputs);
};

const testOracle = async wallet => {
  console.log('-----TEST ORACLE-----');
  const artifact = hre.artifacts.readArtifactSync('AggregatorV3Interface');
  const contract = new ethers.Contract(
    hre.network.config.addressBook.oracles.DaiEth,
    artifact.abi,
    wallet,
  );
  const resp = await contract.functions.latestRoundData();
  console.log(resp[1].toString(), ethers.utils.formatEther(resp[1].toString()));
};

const testTokenConversion = async wallet => {
  console.log('-----TEST TOKEN CONVERSION-----');
  const artifact = hre.artifacts.readArtifactSync('TokenConversion');
  const contract = new ethers.Contract(
    hre.network.config.deployments.TokenConversion,
    artifact.abi,
    wallet,
  );
  console.log("DAI->ETH");
  const r1 = await contract.functions.ethPrice(hre.network.config.addressBook.erc20.DAI);
  console.log(r1.toString(), ethers.utils.formatEther(r1.toString()));
  const resp = await contract.functions.convert(
    ethers.utils.parseEther('1').toString(),
    hre.network.config.addressBook.erc20.DAI,
    ethers.constants.AddressZero,
  );
  console.log(resp.toString(), ethers.utils.formatEther(resp.toString()));
  console.log("USDC->ETH");
  const r2 = await contract.functions.ethPrice(hre.network.config.addressBook.erc20.USDC);
  console.log(r2.toString(), ethers.utils.formatEther(r2.toString()));
  const resp2 = await contract.functions.convert(
    '1000000',
    hre.network.config.addressBook.erc20.USDC,
    ethers.constants.AddressZero,
  );
  console.log(resp2.toString(), ethers.utils.formatEther(resp2.toString()));
  console.log("DAI->ETH 5% slippage");
  const resp3 = await contract.functions.minimumOut(
    ethers.utils.parseEther('1').toString(),
    hre.network.config.addressBook.erc20.DAI,
    ethers.constants.AddressZero,
    20,
    1
  );
  console.log(resp3.toString(), ethers.utils.formatEther(resp3.toString()));
  console.log("DAI->USDC");
  const resp4 = await contract.functions.convert(
    ethers.utils.parseEther('1').toString(),
    hre.network.config.addressBook.erc20.DAI,
    hre.network.config.addressBook.erc20.USDC
  );
  console.log(resp4.toString(), Number(resp4.toString())/1000000);
};

const testActionSafeUniswap = async wallet => {
  console.log('-----TEST ACTION SAFE UNISWAP-----');
  const artifact = hre.artifacts.readArtifactSync('TestAction');
  const testProxy = new ethers.Contract(
    hre.network.config.deployments.TestAction,
    artifact.abi,
    wallet,
  );
  const erc20Artifact = hre.artifacts.readArtifactSync('@gelatonetwork/core/contracts/external/IERC20.sol:IERC20');
  const daiContract = new ethers.Contract(
    hre.network.config.addressBook.erc20.DAI,
    erc20Artifact.abi,
    wallet,
  );
  const currentBalance = await daiContract.functions.balanceOf(
    testProxy.address,
  );
  if (Number(ethers.utils.formatEther(currentBalance.toString())) < 1) {
    const tx = await daiContract.functions.transfer(
      testProxy.address,
      ethers.utils.parseEther('1'),
    );
    console.log('transferred token to proxy:', tx.hash);
  } else {
    console.log('proxy already funded');
  }
  const currentAllowance = await daiContract.functions.allowance(
    testProxy.address,
    hre.network.config.addressBook.uniswapV2.router2,
  );
  if (Number(ethers.utils.formatEther(currentAllowance.toString())) < 1) {
    const tx2 = await testProxy.approveToken(
      daiContract.address,
      hre.network.config.addressBook.uniswapV2.router2,
      ethers.utils.parseEther('1'),
    );
    console.log('proxy approved token for uniswap', tx2.hash);
  } else {
    console.log('proxy already approved');
  }
  const artifact2 = hre.artifacts.readArtifactSync('ActionSafeUniswap');
  const actionABI = artifact2.abi;
  const actionAddress = hre.network.config.deployments.ActionSafeUniswap;
  const delegateCalldata = encodeWithSelector(actionABI, 'action', [
    ethers.utils.parseEther('1'),
    [
      hre.network.config.addressBook.erc20.DAI,
      hre.network.config.addressBook.erc20.WETH,
    ],
    wallet.address,
    3211295150,
    10050
  ]);
  const result = await testProxy.makeDelegatecall(
    actionAddress,
    delegateCalldata,
    { gasLimit: 6000000 },
  );
  console.log('check:', result.hash);
};

(async () => {
  const priv = hre.network.config.accounts[0];
  const providerURL = hre.network.config.url;
  const provider = new ethers.providers.JsonRpcProvider(providerURL);
  const wallet = new ethers.Wallet(priv, provider);
  await testOracle(wallet);
  await testTokenConversion(wallet);
  await testActionSafeUniswap(wallet);
})();
