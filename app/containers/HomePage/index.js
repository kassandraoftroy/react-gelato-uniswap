/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import * as ethers from 'ethers';
import axios from 'axios';
import { useInterval } from 'utils/polling';
import { getTask, graphQLquery } from './gelatoHelpers';
import StepWizard from 'react-step-wizard';
import ConnectWalletStep from 'components/ConnectWalletStep';
import CreateProxyStep from 'components/CreateProxyStep';
import ScheduleUniswapStep from 'components/ScheduleUniswapStep';
import StepNavigation from 'components/StepNavigation';
import './transitions.less';
import './wizard.less';
import 'bootstrap/dist/css/bootstrap.min.css';

const STATIC_SALT = 987654321; // Static Salt for UserProxy

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
  const [proxyContract, setProxyContract] = useState(null);
  const [abiBook, setAbiBook] = useState(null);
  const [addressBook, setAddressBook] = useState(null);

  const [userAddress, setUserAddress] = useState("");
  const [proxyAddress, setProxyAddress] = useState("");
  const [createProxyProgress, setCreateProxyProgress] = useState("");
  const [createProxyTx, setCreateProxyTx] = useState("");

  const [amountInput, setAmountInput] = useState("");
  const [delayInput, setDelayInput] = useState("");
  const [submitTaskProgress, setSubmitTaskProgress] = useState("");
  const [submitTaskTx, setSubmitTaskTx] = useState("");

  const [logMessage, setLogMessage] = useState([]);
  const [currentTasks, setCurrentTasks] = useState([]);

  const handleAmountInput = (e) => {
      setAmountInput(e.target.value);
  }

  const handleDelayInput = (e) => {
      setDelayInput(e.target.value);
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
            let query = graphQLquery(predicted[0]);
            let r2 = await axios.post('https://api.thegraph.com/subgraphs/name/gelatodigital/gelato-network-rinkeby', {query: query}, {});
            if ((r2.data.data.taskReceiptWrappers.length) > 0) {
                let tasks = r2.data.data.taskReceiptWrappers;
                let waitingTasks = [];
                for (let i=0; i<tasks.length; i++) {
                    if (tasks[i].status=="awaitingExec") {
                        waitingTasks.push(tasks[i]);
                    }
                }
                if (waitingTasks.length>0) {
                    setLogMessage('Welcome back! (task is running...)');
                    setCurrentTasks(waitingTasks);
                }
            }
        }
        setProxyContract(proxyContract);
        setContracts({DAI: daiContract, WETH: wethContract, ProxyFactory: proxyFactoryContract});
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
        }
        let gasLimit = 4000000;
        let gasPrice = await contracts.ProxyFactory.signer.provider.getGasPrice();
        let maxWeiGas = gasPrice*gasLimit;
        let balance = await contracts.ProxyFactory.signer.getBalance();
        if (maxWeiGas>balance) {
            setCreateProxyProgress("You don't have enough ETH (need: "+Number(ethers.utils.formatEther(maxWeiGas.toString())).toFixed(7)+")");
            return
        }
        let createTx = await contracts.ProxyFactory.functions.createTwo(STATIC_SALT, {gasLimit: gasLimit, gasPrice: gasPrice});
        setCreateProxyTx(createTx.hash);
        setCreateProxyProgress("Transaction: Creating Proxy...");
        await contracts.ProxyFactory.signer.provider.getTransactionReceipt(createTx.hash);
        let i = 0;
        while (true) {
            try {
                let hasproxy = await contracts.ProxyFactory.functions.isGelatoUserProxy(proxyAddress);
                if (hasproxy[0]) {
                    let proxyContract = new ethers.Contract(proxyAddress, abiBook.Proxy, contracts.DAI.signer);
                    setProxyContract(proxyContract);
                    let daiAllowance = await contracts.DAI.functions.allowance(userAddress, proxyAddress);
                    let wethAllowance = await contracts.WETH.functions.allowance(userAddress, proxyAddress);
                    let allowances = {DAI: ethers.utils.formatEther(daiAllowance.toString()), WETH: ethers.utils.formatEther(wethAllowance.toString())};
                    setProxyAllowance(allowances);
                    setIsProxyLoaded(hasproxy[0]);
                    setCreateProxyProgress("")
                    setCreateProxyTx("");
                    break
                } else {
                    console.log("waiting for proxy tx...");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    i++;
                    if (i%3==1) {
                        setCreateProxyProgress("Transaction: Creating Proxy.");
                    } else if (i%3==2) {
                        setCreateProxyProgress("Transaction: Creating Proxy..");
                    } else {
                        setCreateProxyProgress("Transaction: Creating Proxy...");
                    }
                }
            } catch(e) {
                console.log("error waiting for proxy tx:", e.message);
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
    try {
        let amountDai = Number(amountInput);
        amount = ethers.utils.parseEther(amountDai.toString());
        delay = Number(delayInput);
    } catch(e) {
        console.log('error:', e.message);
    }
    if (amount==null||delay==null) {
        setSubmitTaskProgress("Malformed inputs");
        return
    }
    let totalBalance = await contracts.DAI.functions.balanceOf(userAddress);
    let currentAllowance = await contracts.DAI.functions.allowance(userAddress, proxyAddress);
    try {
        if (totalBalance[0]-currentAllowance[0]>0) {
            let approveTx = await contracts.DAI.functions.approve(proxyAddress, totalBalance.toString(), {gasLimit: 150000, gasPrice: ethers.utils.parseUnits("15", "gwei")});
            setSubmitTaskProgress("Transaction: Approving Proxy...");
            setSubmitTaskTx(approveTx.hash);
        }
        let task = await getTask(userAddress, proxyAddress, amount, delay, abiBook, addressBook, contracts.DAI.signer.provider);
        let gelatoProvider = {
            addr: addressBook.GelatoProvider,
            module: addressBook.GelatoProviderModule,
        }
        let tx = await proxyContract.submitTaskCycle(gelatoProvider, [task], 0, 0, {gasLimit: 1000000, gasPrice: ethers.utils.parseUnits("15", "gwei")});
        setSubmitTaskProgress("Transaction: Submitting Task...");
        setSubmitTaskTx(tx.hash);
        let receipt;
        let i=0;
        while (true) {
            receipt = await contracts.DAI.signer.provider.getTransactionReceipt(tx.hash);
            if (receipt != null) {
                break
            } else {
                await new Promise(resolve => setTimeout(resolve, 2000));
                i++;
                if (i%3==1) {
                    setSubmitTaskProgress("Transaction: Submitting Task.");
                } else if (i%3==2) {
                    setSubmitTaskProgress("Transaction: Submitting Task..");
                } else {
                    setSubmitTaskProgress("Transaction: Submitting Task...");
                }
            }
        }
        setSubmitTaskProgress("");
        setSubmitTaskTx("");
        setIsSubmitTask(false);
    } catch(e) {
        console.log("error in handleSubmitTask:", e.message);
    }
  }

  const handleCancelTask = async () => {
    try {
        let query = graphQLquery(proxyAddress);
        let r = await axios.post('https://api.thegraph.com/subgraphs/name/gelatodigital/gelato-network-rinkeby', {query: query}, {});
        let tasks = r.data.data.taskReceiptWrappers;
        let waitingTasks = [];
        setSubmitTaskProgress(`Transaction: Canceling task...`);
        for (let i=0; i<tasks.length; i++) {
            if (tasks[i].status=="awaitingExec") {
                waitingTasks.push(tasks[i]);
            }
        }
        for (let j=0; j<waitingTasks.length; j++) {
            let tx = await proxyContract.cancelTask(waitingTasks[j].taskReceipt, {gasLimit:200000, gasPrice:ethers.utils.parseUnits("15", "gwei")});
            setSubmitTaskTx(tx.hash);
            let k = 0
            while (true) {
                let receipt = await contracts.DAI.signer.provider.getTransactionReceipt(tx.hash);
                if (receipt != null) {
                    break
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    k++;
                    let str = 'Transaction: Canceling task';
                    if (j>0) {
                        str = str + `(${j})`;
                    }
                    if (k%3==1) {
                        str = str+'.';
                    } else if (k%3==2) {
                        str = str+'..';
                    } else {
                        str = str+'...';
                    }
                }
            }
        }
        setSubmitTaskProgress("")
        setSubmitTaskTx("");
        setLogMessage('Canceled Task(s)');
        setIsCancelTask(false);
    } catch(e) {
        console.log("error in handleCancelTask:", e.message);
    }
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
            let query = graphQLquery(proxyAddress);
            let r = await axios.post('https://api.thegraph.com/subgraphs/name/gelatodigital/gelato-network-rinkeby', {query: query}, {});
            let tasks = r.data.data.taskReceiptWrappers;
            let waitingTasks = [];
            for (let i=0; i<tasks.length; i++) {
                if (tasks[i].status=="awaitingExec") {
                    
                }
            }
            if (JSON.stringify(waitingTasks)!==JSON.stringify(currentTasks)) {
                setCurrentTasks(waitingTasks);
                if (waitingTasks.length>currentTasks.length || (waitingTasks.length>0 && currentTasks.length>0 && waitingTasks[0].cycleId!=currentTasks[0].cycleId)) {
                    if (logMessage.includes('New task')) {
                        let index = parseInt(logMessage.substring(logMessage.length-2, logMessage.length-1));
                        let str = `New task in the queue (${index+1})`;
                        setLogMessage(str);
                    } else {
                        setLogMessage('New task in the queue (0)');
                    }
                }
            }
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
                                switchSubmitTask={switchSubmitTask}
                                switchCancelTask={switchCancelTask}
                                submitTaskProgress={submitTaskProgress}
                                submitTaskTx={submitTaskTx}
                            />
                        </StepWizard>
                        {logMessage!="" ? <p className="centered">Log: {logMessage}</p>:<span></span>}
                    </div>
                </div>
            </div>
        </div>
  );
}
