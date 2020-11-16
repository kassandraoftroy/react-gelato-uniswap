const ethers = require('ethers');
const hre = require('hardhat');
require("dotenv").config();

const CALL_OP = 0;
const DELEGATECALL_OP = 1;

var deployAction = async (wallet) => {
	let artifact = hre.artifacts.readArtifactSync('ActionStablecoinFee');
    let factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
	let deployTx = factory.getDeployTransaction(wallet.address, "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e", "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa", 450000, 80000000000);
	deployTx.gasLimit = 3500000;
	deployTx.gasPrice = ethers.utils.parseUnits("10", "gwei");
	try {
        let tx = await wallet.sendTransaction(deployTx);
        let receipt;
        console.log("\n Waiting for deploy TX to get mined...");
        while (true) {
            receipt = await wallet.provider.getTransactionReceipt(tx.hash);
            if (receipt != null) {
                break
            } else {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        console.log(" Deploy TX successfully mined ✅");
		return receipt.contractAddress;
	} catch(e) {
		console.log('error deploying contract:', e.message);
		return
	}
}

var setupProvider = async (wallet, actionStablecoinFeeAddress, fundsToProvide) => {
    const DAI = hre.network.config.addressBook.erc20.DAI;
    const UNISWAP_V2_Router_02 = hre.network.config.addressBook.uniswapV2.router2;
  
    const gelatoCoreAddress = hre.network.config.deployments.GelatoCore;
    const providerModuleGelatoUserProxyAddress = hre.network.config.deployments.ProviderModuleGelatoUserProxy;
    const executorAddress = hre.network.config.addressBook.gelatoExecutor.default;
    const myProviderAddress = wallet.address;

    const conditionTimeStatefulAddress = hre.network.config.deployments.ConditionTimeStateful;

    const artifact = hre.artifacts.readArtifactSync('GelatoCore');
    const gelatoCoreAbi = artifact.abi;
  
    const actionStablecoinFee = {
        addr: actionStablecoinFeeAddress, 
        data: ethers.constants.HashZero, 
        operation: DELEGATECALL_OP, 
        dataFlow: 0, 
        value: ethers.constants.Zero, 
        termsOkCheck: false
    };

    const actionTransferFrom = {
        addr: DAI, 
        data: ethers.constants.HashZero, 
        operation: CALL_OP, 
        dataFlow: 0, 
        value: ethers.constants.Zero, 
        termsOkCheck: false
    };
  
    const actionApproveUniswapRouter = {
        addr: DAI, 
        data: ethers.constants.HashZero, 
        operation: CALL_OP, 
        dataFlow: 0, 
        value: ethers.constants.Zero, 
        termsOkCheck: false
    };

  
    const actionSwapTokensUniswap = {
      addr: UNISWAP_V2_Router_02,
      data: ethers.constants.HashZero,
      operation: CALL_OP, 
      dataFlow: 0, 
      value: ethers.constants.Zero, 
      termsOkCheck: false
    };
  
    const actionUpdateConditionTime = {
      addr: conditionTimeStatefulAddress,
      data: ethers.constants.HashZero,
      operation: CALL_OP,
      dataFlow: 0, 
      value: ethers.constants.Zero, 
      termsOkCheck: false,
    };

    const gasPriceCeil = ethers.utils.parseUnits("80", "gwei");
  
    const gelatoUniswapTaskSpec1 = {
      conditions: [conditionTimeStatefulAddress],
      actions: [
        actionStablecoinFee,
        actionTransferFrom,
        actionApproveUniswapRouter,
        actionSwapTokensUniswap,
        actionUpdateConditionTime,
      ],    
      gasPriceCeil: gasPriceCeil,
    };

    const gelatoUniswapTaskSpec2 = {
        conditions: [conditionTimeStatefulAddress],
        actions: [
          actionTransferFrom,
          actionTransferFrom,
          actionApproveUniswapRouter,
          actionSwapTokensUniswap,
          actionUpdateConditionTime,
        ],    
        gasPriceCeil: gasPriceCeil,     
    };

    let gelatoCore = new ethers.Contract(gelatoCoreAddress, gelatoCoreAbi, wallet);
    const currentProviderFunds = await gelatoCore.providerFunds(myProviderAddress);
    const assignedExecutor = await gelatoCore.executorByProvider(myProviderAddress);
    const taskSpecProviderStatus1 = await gelatoCore.isTaskSpecProvided(myProviderAddress, gelatoUniswapTaskSpec1);
    const taskSpecProviderStatus2 = await gelatoCore.isTaskSpecProvided(myProviderAddress, gelatoUniswapTaskSpec2);
    let tasks = [];
    if (taskSpecProviderStatus1 === "TaskSpecNotProvided") {
        tasks.push(gelatoUniswapTaskSpec1);
    }
    if (taskSpecProviderStatus2 === "TaskSpecNotProvided") {
        tasks.push(gelatoUniswapTaskSpec2);
    }
    const noExecutorAssigned = assignedExecutor === ethers.constants.AddressZero ? true : false;
    const moduleIsProvided = await gelatoCore.isModuleProvided(myProviderAddress, providerModuleGelatoUserProxyAddress);
    let value;
    if (fundsToProvide == null || !currentProviderFunds.lt(fundsToProvide)) {
        value = ethers.constants.Zero;
    } else {
        value = fundsToProvide-currentProviderFunds;
    }

    // The single Transaction that completes Steps 2-5: gelatoCore.multiProvide()
    if (noExecutorAssigned || !moduleIsProvided || value > 0) {
        let multiProvideTx;
        try {
            multiProvideTx = await gelatoCore.multiProvide(
                noExecutorAssigned ? executorAddress : ethers.constants.AddressZero,
                tasks,
                !moduleIsProvided ? [providerModuleGelatoUserProxyAddress] : [],
            {
                value: value.toString(),
                gasLimit: 6000000,
                gasPrice: ethers.utils.parseUnits("10", "gwei"),
            }
            );
        } catch (error) {
            console.error("\n PRE provide TX error ❌  \n", error);
            process.exit(1);
        }
        try {
            console.log("\n Waiting for provide TX to get mined...");
            await multiProvideTx.wait();
            console.log(" Provide TX successfully mined ✅\n");
        } catch (error) {
            console.error("\n Provide TX error ❌ ", error);
            process.exit(1);
        }
    } else {
        console.log("\n Gelato Provider already up to date ✅ \n");
    }
}

(async () => {
    let args = process.argv;
    let priv = hre.network.config.accounts[0];
	let providerURL = hre.network.config.url;
    let provider = new ethers.providers.JsonRpcProvider(providerURL);
    let wallet = new ethers.Wallet(priv, provider);
    let feeAddress = process.env.DAPP_FEE_ACTION_ADDR;
    if (feeAddress==null||feeAddress=="") {
        let contractAddress = await deployAction(wallet);
        if (contractAddress==null) {
            return
        }
        console.log('\n !! IMPORTANT !!\n Set in .env file:\n\n DAPP_FEE_ACTION_ADDR="'+contractAddress+'"');
        feeAddress = contractAddress;
    }
    let fundsToProvide;
    if (args.length >= 3) {
        fundsToProvide = ethers.utils.parseEther(args[2]);
    }
	await setupProvider(wallet, feeAddress, fundsToProvide);
})();

