/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import * as ethers from 'ethers';
import axios from 'axios';
import { useInterval } from 'utils/polling';
import getTask from './gelatoHelpers';
import StepWizard from 'react-step-wizard';
import ConnectWalletStep from 'components/ConnectWalletStep';
import CreateProxyStep from 'components/CreateProxyStep';
import ScheduleUniswapStep from 'components/ScheduleUniswapStep';
import StepNavigation from 'components/StepNavigation';
import './transitions.less';
import './wizard.less';
import 'bootstrap/dist/css/bootstrap.min.css';

const STATIC_SALT = 12345676; // Static Salt for UserProxy

const transitions = {
    enterRight: `animated enterRight`,
    enterLeft: `animated enterLeft`,
    exitRight: `animated exitRight`,
    exitLeft: `animated exitLeft`,
    intro: `animated intro`,
};

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isProxyLoaded, setIsProxyLoaded] = useState(false);
  const [isSubmitTask, setIsSubmitTask] = useState(false);
  const [isCancelTask, setIsCancelTask] = useState(false);

  const [userBalances, setUserBalances] = useState(null);
  const [proxyAllowance, setProxyAllowance] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [abiBook, setAbiBook] = useState(null);
  const [addressBook, setAddressBook] = useState(null);

  const [userAddress, setUserAddress] = useState("");
  const [proxyAddress, setProxyAddress] = useState("");
  const [createProxyProgress, setCreateProxyProgress] = useState("");
  const [createProxyTx, setCreateProxyTx] = useState("");

  const [amountInput, setAmountInput] = useState("");
  const [delayInput, setDelayInput] = useState("");
  const [allowanceInput, setAllowanceInput] = useState("");
  const [submitTaskProgress, setSubmitTaskProgress] = useState("");
  const [submitTaskTx, setSubmitTaskTx] = useState("");

  const handleAmountInput = (e) => {
      setAmountInput(e.target.value);
  }

  const handleDelayInput = (e) => {
      setDelayInput(e.target.value);
  }

  const handleAllowanceInput = (e) => {
      setAllowanceInput(e.target.value);
  }

  const switchSubmitTask = (_e) => {
      setIsSubmitTask(!isSubmitTask);
  }

  const switchCancelTask = (_e) => {
    setIsCancelTask(!isCancelTask);
  }

  const handleConnectWallet = async (_e) => {
    try {
        await window.ethereum.enable();
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = provider.getSigner();
        let address = await signer.getAddress();
        let ethBalance = await signer.getBalance();
        let r = await axios.post('http://127.0.0.1:3000/contracts', {}, {});
        let abis = {DAI: r.data.DAI.abi, WETH: r.data.WETH.abi, ProxyFactory: r.data.GelatoUserProxyFactory.abi, UniswapRouter: r.data.UniswapRouter.abi, ActionStablecoinFee: r.data.ActionStablecoinFee.abi, ConditionTimeStateful: r.data.ConditionTimeStateful.abi, GelatoCore: r.data.GelatoCore.abi, Proxy: r.data.IGelatoUserProxy.abi};
        let addresses = {DAI: r.data.DAI.address, WETH: r.data.WETH.address, ProxyFactory: r.data.GelatoUserProxyFactory.address, UniswapRouter: r.data.UniswapRouter.address, ActionStablecoinFee: r.data.ActionStablecoinFee.address, ConditionTimeStateful: r.data.ConditionTimeStateful.address, GelatoCore: r.data.GelatoCore.address, GelatoProvider: r.data.GelatoProvider.address, GelatoProviderModule: r.data.GelatoProviderModule.address};
        setAbiBook(abis);
        setAddressBook(addresses);
        let daiContract = new ethers.Contract(r.data.DAI.address, r.data.DAI.abi, signer);
        let wethContract = new ethers.Contract(r.data.WETH.address, r.data.WETH.abi, signer);
        let proxyFactoryContract = new ethers.Contract(r.data.GelatoUserProxyFactory.address, r.data.GelatoUserProxyFactory.abi, signer);
        let gelatoCoreContract = new ethers.Contract(r.data.GelatoCore.address, r.data.GelatoCore.abi, signer);
        let daiBalance = await daiContract.functions.balanceOf(address);
        let wethBalance = await wethContract.functions.balanceOf(address);
        let predicted = await proxyFactoryContract.functions.predictProxyAddress(address, STATIC_SALT);
        setProxyAddress(predicted.toString());
        let hasproxy = await proxyFactoryContract.functions.isGelatoUserProxy(predicted.toString());
        setIsProxyLoaded(hasproxy[0]);
        let proxyContract;
        if (hasproxy[0]) {
            proxyContract = new ethers.Contract(predicted[0], r.data.IGelatoUserProxy.abi, signer);
            let daiAllowance = await daiContract.functions.allowance(address, predicted[0]);
            let wethAllowance = await wethContract.functions.allowance(address, predicted[0]);
            setProxyAllowance({DAI: ethers.utils.formatEther(daiAllowance.toString()), WETH: ethers.utils.formatEther(wethAllowance.toString())});
        }
        setContracts({DAI: daiContract, WETH: wethContract, ProxyFactory: proxyFactoryContract, GelatoCore: gelatoCoreContract, Proxy: proxyContract});
        setUserAddress(address);
        setUserBalances({ETH: ethers.utils.formatEther(ethBalance.toString()), WETH: ethers.utils.formatEther(wethBalance.toString()), DAI: ethers.utils.formatEther(daiBalance.toString())});
        setIsConnected(true);
    } catch(e) {
        console.log('error in handleConnectWallet:', e.message);
        setIsConnected(false);
    }
  }

  const handleCreateProxy = async (_e) => {
      try {
        let hasproxy = await contracts.ProxyFactory.functions.isGelatoUserProxy(proxyAddress);
        if (hasproxy[0]) {
            setCreateProxyProgress("Proxy already created. Refresh page.");
            return
        } else {
            setCreateProxyProgress("Creating Proxy...");
        }
        let gasLimit = 4000000;
        let gasPrice = await contracts.ProxyFactory.signer.provider.getGasPrice();
        let maxWeiGas = gasPrice*gasLimit;
        let balance = await contracts.ProxyFactory.signer.getBalance();
        if (maxWeiGas>balance) {
            setCreateProxyProgress("You don't have enough ETH (need: "+Number(ethers.utils.formatEther(maxWeiGas.toString())).toFixed(7)+")");
        }
        let createTx = await contracts.ProxyFactory.functions.createTwo(STATIC_SALT, {gasLimit: gasLimit, gasPrice: gasPrice});
        setCreateProxyTx(createTx.hash);
        setCreateProxyProgress("Transaction submitted...");
        await contracts.ProxyFactory.signer.provider.getTransactionReceipt(createTx.hash);
        while (true) {
            try {
                let hasproxy = await contracts.ProxyFactory.functions.isGelatoUserProxy(proxyAddress);
                if (hasproxy[0]) {
                    let proxyContract = new ethers.Contract(proxyAddress, abiBook.Proxy, contracts.DAI.signer);
                    let contracts2 = JSON.parse(JSON.stringify(contracts));
                    contracts2.Proxy = proxyContract;
                    setContracts(contracts);
                    let daiAllowance = await contracts.DAI.functions.allowance(userAddress, proxyAddress);
                    let wethAllowance = await contracts.WETH.functions.allowance(userAddress, proxyAddress);
                    let allowances = {DAI: ethers.utils.formatEther(daiAllowance.toString()), WETH: ethers.utils.formatEther(wethAllowance.toString())};
                    setProxyAllowance(allowances);
                    setIsProxyLoaded(hasproxy[0]);
                    setCreateProxyTx("");
                } else {
                    console.log("waiting for proxy tx...");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch(e) {
                console.log("error waiting for proxy tx...", e.message);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
      } catch(e) {
          console.log("error in handleGetProxy:", e.message);
      }
  }

  const handleSubmitTask = async(_e) => {
    let amount;
    let delay;
    let allowance;
    console.log('submitting task');
    try {
        let amountDai = Number(amountInput);
        amount = ethers.utils.parseEther(amountDai.toString());
        delay = Number(delayInput);
        let maxAllowanceDai = Number(allowanceInput);
        allowance = ethers.utils.parseEther(maxAllowanceDai.toString());
        await contracts.DAI.functions.balanceOf(userAddress);
    } catch(e) {
        console.log('error here:', e.message);
    }
    if (amount==null) {
        setSubmitTaskProgress("Malformed inputs");
        return
    }
    if (allowance==null) {
        allowance = await contracts.DAI.functions.balanceOf(userAddress);
    }
    try {
        let approveTx = await contracts.DAI.functions.approve(proxyAddress, allowance.toString(), {gasLimit: 150000, gasPrice: ethers.utils.parseUnits("10", "gwei")});
        setSubmitTaskProgress("Approving proxy to spend dai...");
        let task = await getTask(userAddress, proxyAddress, amount, delay, abiBook, addressBook, contracts.DAI.signer.provider);
        console.log("encoded task!");
        console.log("task:", task);
        let gelatoProvider = {
            addr: addressBook.GelatoProvider,
            module: addressBook.GelatoProviderModule,
        }
        let tx = await contracts.Proxy.submitTaskCycle(gelatoProvider, [task], 0, 1000, {gasLimit: 1000000, gasPrice: ethers.utils.parseUnits("10", "gwei")});
        setSubmitTaskProgress("Task transaction submitted...");
        setSubmitTaskTx(tx.hash);
        let receipt;
        while (true) {
            receipt = await contracts.DAI.signer.provider.getTransactionReceipt(tx.hash);
            if (receipt != null) {
                break
            } else {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        setSubmitTaskProgress(JSON.stringify(receipt.logs[0].data));
        setIsSubmitTask(false);
    } catch(e) {
        console.log()
        console.log("error in handleSubmitTask:", e.message);
    }
  }

  const handleCancelTask = () => {
      console.log('handle cancel task');
  };

  useInterval(async ()=>{
    if (isConnected) {
        let ethBalance = await contracts.DAI.signer.getBalance();
        let daiBalance = await contracts.DAI.functions.balanceOf(userAddress);
        let wethBalance = await contracts.WETH.functions.balanceOf(userAddress);
        let balances = {ETH: ethers.utils.formatEther(ethBalance.toString()), WETH: ethers.utils.formatEther(wethBalance.toString()), DAI: ethers.utils.formatEther(daiBalance.toString())};
        setUserBalances(balances);
        if (isProxyLoaded) {
            let daiAllowance = await contracts.DAI.functions.allowance(userAddress, proxyAddress);
            let wethAllowance = await contracts.WETH.functions.allowance(userAddress, proxyAddress);
            let allowances = {DAI: ethers.utils.formatEther(daiAllowance.toString()), WETH: ethers.utils.formatEther(wethAllowance.toString())};
            setProxyAllowance(allowances);
        }
    }
  }, 3000);

  return (
        <div className='container'>
            <br></br>
            <h1 className='centered myFont'><FormattedMessage {...messages.header} /></h1>
            <div className='jumbotron grad'>
                <div className='row'>
                    <div className={`col-12 col-sm-6 offset-sm-3 rsw-wrapper myFont`}>
                        <StepWizard 
                            transitions={transitions} 
                            nav={<StepNavigation />}
                            onStepChange={() => {setIsSubmitTask(false); setIsCancelTask(false)}}
                        >
                            <ConnectWalletStep 
                                isConnected={isConnected} 
                                walletHandler={handleConnectWallet} 
                                userBalances={userBalances} 
                                userAddress={userAddress}
                            />
                            <CreateProxyStep 
                                isConnected={isConnected}
                                isProxyLoaded={isProxyLoaded}
                                createProxyHandler={handleCreateProxy}
                                createProxyProgress={createProxyProgress}
                                createProxyTx={createProxyTx}
                                proxyAllowance={proxyAllowance}
                            />
                            <ScheduleUniswapStep 
                                isConnected={isConnected}
                                isProxyLoaded={isProxyLoaded}
                                isSubmitTask={isSubmitTask}
                                isCancelTask={isCancelTask}
                                submitTaskHandler={handleSubmitTask}
                                cancelTaskHandler={handleCancelTask}
                                amountHandler={handleAmountInput}
                                delayHandler={handleDelayInput}
                                allowanceHandler={handleAllowanceInput}
                                switchSubmitTask={switchSubmitTask}
                                switchCancelTask={switchCancelTask}
                                submitTaskProgress={submitTaskProgress}
                                submitTaskTx={submitTaskTx}
                            />
                        </StepWizard>
                    </div>
                </div>
            </div>
        </div>
  );
}
