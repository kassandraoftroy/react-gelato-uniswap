import * as ethers from 'ethers';

const encodeWithSelector = (abi, functionname, inputs) => {
  const iface = new ethers.utils.Interface(abi);
  return iface.encodeFunctionData(functionname, inputs);
};

const CALL_OP = 0;
const DELEGATECALL_OP = 1;

export const getTask = async (
  userAddress,
  userProxyAddress,
  amount,
  delaySeconds,
  abis,
  addresses,
  provider,
) => {
  const conditionTimeContract = new ethers.Contract(
    addresses.ConditionTimeStateful,
    abis.ConditionTimeStateful,
    provider,
  );
  const conditionData = await conditionTimeContract.functions.getConditionData(
    userProxyAddress,
  );

  const conditionEveryXSeconds = {
    inst: addresses.ConditionTimeStateful,
    data: conditionData[0],
  };

  const actionStablecoinFee = {
    addr: addresses.ActionStablecoinFee,
    data: encodeWithSelector(abis.ActionStablecoinFee, 'action', [userAddress]),
    operation: DELEGATECALL_OP,
    dataFlow: 0,
    value: ethers.constants.Zero,
    termsOkCheck: false,
  };

  /* const actionTransferToProvider = {
        addr: addresses.DAI,
        data: encodeWithSelector(abis.DAI, "transferFrom", [userAddress, addresses.GelatoProvider, feeAmount.toString()]),
        operation: CALL_OP,
        dataFlow: 0,
        value: ethers.constants.Zero,
        termsOkCheck: false,
    } */

  const actionTransferToProxy = {
    addr: addresses.DAI,
    data: encodeWithSelector(abis.DAI, 'transferFrom', [
      userAddress,
      userProxyAddress,
      amount.toString(),
    ]),
    operation: CALL_OP,
    dataFlow: 0,
    value: ethers.constants.Zero,
    termsOkCheck: false,
  };

  const actionApproveUniswapRouter = {
    addr: addresses.DAI,
    data: encodeWithSelector(abis.DAI, 'approve', [
      addresses.UniswapRouter,
      amount.toString(),
    ]),
    operation: CALL_OP,
    dataFlow: 0,
    value: ethers.constants.Zero,
    termsOkCheck: false,
  };

  const tokenPath = [addresses.DAI, addresses.WETH];

  const actionSwapTokensUniswap = {
    addr: addresses.ActionSafeUniswap,
    data: encodeWithSelector(abis.ActionSafeUniswap, 'action', [
      amount.toString(),
      tokenPath,
      userAddress,
      4102448461,
    ]),
    operation: DELEGATECALL_OP,
    dataFlow: 0,
    value: ethers.constants.Zero,
    termsOkCheck: false,
  };

  const actionUpdateConditionTime = {
    addr: addresses.ConditionTimeStateful,
    data: encodeWithSelector(abis.ConditionTimeStateful, 'setRefTime', [
      delaySeconds,
      0,
    ]),
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
      // actionTransferToProvider,
      actionStablecoinFee,
      actionTransferToProxy,
      actionApproveUniswapRouter,
      actionSwapTokensUniswap,
      actionUpdateConditionTime,
    ],
    selfProviderGasLimit: 0,
    selfProviderGasPriceCeil: 0,
  };
};
export const graphQLquery = address => `query { taskReceiptWrappers(where: {user: "${address.toLowerCase()}"}) {
        taskReceipt {
          id
          userProxy
          provider {
            addr
            module
          }
          index
          tasks {
            conditions {
              inst
              data
            }
            actions {
              addr
              data
              operation
              dataFlow
              value
              termsOkCheck
            }
            selfProviderGasLimit
            selfProviderGasPriceCeil
          }
          expiryDate
          cycleId
          submissionsLeft
        }
        submissionHash
        status
        submissionDate
        executionDate
        executionHash
        selfProvided
      }
    }`;
