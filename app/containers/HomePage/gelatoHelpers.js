import * as ethers from 'ethers';

const encodeWithSelector = (abi, functionname, inputs) => {
    let iface = new ethers.utils.Interface(abi);
    return iface.encodeFunctionData(functionname, inputs);
}

const CALL_OP = 0;
const DELEGATECALL_OP = 1;

const getTask = async (userAddress, userProxyAddress, amount, delaySeconds, abis, addresses, provider) => {
  let conditionTimeContract = new ethers.Contract(addresses.ConditionTimeStateful, abis.ConditionTimeStateful, provider);
  let conditionData = await conditionTimeContract.functions.getConditionData(userProxyAddress);
  let feeActionContract = new ethers.Contract(addresses.ActionStablecoinFee, abis.ActionStablecoinFee, provider);
  let feeActionData = await feeActionContract.functions.getActionData(userAddress);

  const conditionEveryXSeconds = {
    inst: addresses.ConditionTimeStateful,
    data: conditionData[0],
  };

  const actionStablecoinFee = {
    addr: addresses.ActionStablecoinFee, 
    data: feeActionData[0],
    operation: DELEGATECALL_OP, 
    dataFlow: 0,
    value: ethers.constants.Zero,
    termsOkCheck: false
  };

  const actionTransferToProvider = {
      addr: addresses.DAI,
      data: encodeWithSelector(abis.DAI, "transferFrom", [userAddress, addresses.GelatoProvider, ethers.utils.parseEther("1")]),
      operation: CALL_OP,
      dataFlow: 0,
      value: ethers.constants.Zero,
      termsOkCheck: false,
  }

  const actionTransferToProxy = {
      addr: addresses.DAI,
      data: encodeWithSelector(abis.DAI, "transferFrom", [userAddress, userProxyAddress, amount]),
      operation: CALL_OP,
      dataFlow: 0, 
      value: ethers.constants.Zero, 
      termsOkCheck: false,
  };

  const actionApproveUniswapRouter = {
      addr: addresses.DAI,
      data: encodeWithSelector(abis.DAI, "approve", [addresses.UniswapRouter, amount]),
      operation: CALL_OP,
      dataFlow: 0, 
      value: ethers.constants.Zero, 
      termsOkCheck: false,
  };

    const tokenPath = [addresses.DAI, addresses.WETH];

    const actionSwapTokensUniswap = {
      addr: addresses.UniswapRouter,
      data: encodeWithSelector(abis.UniswapRouter, "swapExactTokensForTokens", [amount, 0, tokenPath, userAddress, 4102448461]),
      operation: CALL_OP,
      dataFlow: 0, 
      value: ethers.constants.Zero, 
      termsOkCheck: false,
    };

    const actionUpdateConditionTime = {
      addr: addresses.ConditionTimeStateful,
      data: encodeWithSelector(abis.ConditionTimeStateful, "setRefTime", [delaySeconds, 0]),
      operation: CALL_OP,
      dataFlow: 0, 
      value: ethers.constants.Zero, 
      termsOkCheck: false,
    };

    // This is all the info we need to submit this task to Gelato
    return {
      // All the conditions have to be met
      conditions: [conditionEveryXSeconds],
      // These Actions have to be executed in the same TX all-or-nothing
      actions: [
        //actionStablecoinFee,
        actionTransferToProvider,
        actionTransferToProxy,
        actionApproveUniswapRouter,
        actionSwapTokensUniswap,
        actionUpdateConditionTime,
      ],
      selfProviderGasLimit: 0,
      selfProviderGasPriceCeil: 0
    };
}

export default getTask;