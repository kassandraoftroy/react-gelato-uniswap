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

const STATIC_SALT = 1234321; // Static Salt For Dynamic

const encodeWithSelector = (abi, functionname, inputs) => {
    let iface = new ethers.utils.Interface(abi);
    return iface.functions[functionname].encode(inputs);
}

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasProxy, setHasProxy] = useState(false);
  const [isRunningTaskLoop, setIsRunningTaskLoop] = useState(false);

  const [userBalances, setUserBalances] = useState(null);
  const [proxyAllowance, setProxyAllowance] = useState(null);
  const [contracts, setContracts] = useState(null);

  const [userAddress, setUserAddress] = useState("");
  const [proxyAddress, setProxyAddress] = useState("");
  const [createProxyProgress, setCreateProxyProgress] = useState("");
  const [createProxyTx, setCreateProxyTx] = useState("");
  const [approveDaiProgress, setApproveDaiProgress] = useState("");
  const [approveDaiTx, setApproveDaiTx] = useState("");

  const handleConnectWallet = async (_e) => {
    try {
        await window.ethereum.enable();
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = provider.getSigner();
        let address = await signer.getAddress();
        let ethBalance = await signer.getBalance();
        let r = await axios.post('http://127.0.0.1:3000/contracts', {}, {});
        let daiContract = new ethers.Contract(r.data.DAI.address, r.data.DAI.abi, signer);
        let wethContract = new ethers.Contract(r.data.WETH.address, r.data.WETH.abi, signer);
        let proxyFactory = new ethers.Contract(r.data.GelatoUserProxyFactory.address, r.data.GelatoUserProxyFactory.abi, signer);
        let daiBalance = await daiContract.functions.balanceOf(address);
        let wethBalance = await wethContract.functions.balanceOf(address);
        let predicted = await proxyFactory.functions.predictProxyAddress(address, STATIC_SALT);
        setProxyAddress(predicted[0]);
        let hasproxy = await proxyFactory.functions.isGelatoUserProxy(predicted[0]);
        setHasProxy(hasproxy[0]);
        if (hasproxy[0]) {
            let daiAllowance = await daiContract.functions.allowance(address, predicted[0]);
            let wethAllowance = await wethContract.functions.allowance(address, predicted[0]);
            setProxyAllowance({DAI: ethers.utils.formatEther(daiAllowance.toString()), WETH: ethers.utils.formatEther(wethAllowance.toString())});
        }
        setUserAddress(address);
        setContracts({DAI: daiContract, WETH: wethContract, ProxyFactory: proxyFactory});
        setUserBalances({ETH: ethers.utils.formatEther(ethBalance.toString()), WETH: ethers.utils.formatEther(wethBalance.toString()), DAI: ethers.utils.formatEther(daiBalance.toString())});
        setIsConnected(true);
    } catch(e) {
        console.log('error in handleConnectWallet:', e.message);
        setIsConnected(false);
    }
  }

  const handleGetProxy = async (_e) => {
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
        console.log('create!', createTx.hash);
        setCreateProxyTx(createTx.hash);
        setCreateProxyProgress("Transaction submitted...");
        await contracts.ProxyFactory.signer.provider.getTransactionReceipt(createTx.hash);
        while (true) {
            try {
                let hasproxy = await contracts.ProxyFactory.functions.isGelatoUserProxy(proxyAddress);
                if (hasproxy[0]) {
                    let daiAllowance = await contracts.DAI.functions.allowance(userAddress, proxyAddress);
                    let wethAllowance = await contracts.WETH.functions.allowance(userAddress, proxyAddress);
                    let allowances = {DAI: ethers.utils.formatEther(daiAllowance.toString()), WETH: ethers.utils.formatEther(wethAllowance.toString())};
                    setProxyAllowance(allowances);
                    setHasProxy(hasproxy[0]);
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

  const handleApproveDai = async (_e) => {
      try {
        let ele = document.getElementById('daiAllowance');
        let amountDai = Number(ele.value);
        let amount = ethers.utils.parseEther(amountDai.toString());
        ele.value = "";
        let gasLimit = 100000;
        let gasPrice = await contracts.DAI.signer.provider.getGasPrice();
        let maxWeiGas = gasPrice*gasLimit;
        let balance = await contracts.DAI.signer.getBalance();
        if (maxWeiGas>balance) {
            setApproveDaiProgress("You don't have enough ETH (need: "+Number(ethers.utils.formatEther(maxWeiGas.toString())).toFixed(7)+")");
        } else {
            setApproveDaiProgress("Approving...");
        }
        let tx = await contracts.DAI.functions.approve(proxyAddress, amount, {gasLimit: gasLimit, gasPrice: gasPrice});
        setApproveDaiTx(tx.hash);
        setApproveDaiProgress("Transaction submitted...");
        await contracts.DAI.signer.provider.getTransactionReceipt(tx.hash);
        while (true) {
            try {
                let rawDaiAllowance = await contracts.DAI.functions.allowance(userAddress, proxyAddress);
                let newDaiAllowance = ethers.utils.formatEther(rawDaiAllowance.toString());
                if (Number(newDaiAllowance) != Number(proxyAllowance.DAI)) {
                    setCreateProxyProgress("Transaction mined...");
                    let allowances = JSON.parse(JSON.stringify(proxyAllowance));
                    allowances.DAI = newDaiAllowance;
                    setApproveDaiProgress("");
                    setApproveDaiTx("");
                    setProxyAllowance(allowances);
                } else {
                    console.log("waiting for approve tx...");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch(e) {
                console.log("error waiting for approve tx...", e.message);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
      } catch(e) {
          console.log("error in handleApproveDai:", e.message);
      }
  }

  const load = async () => {
    try {
        setIsLoaded(true);
    } catch(e) {
        console.log("error in load:", e.message);
    }
  }

  useEffect(() => {
    (async () => await load())();
  }, []);

  useInterval(async ()=>{
    if (isConnected) {
        let ethBalance = await contracts.DAI.signer.getBalance();
        let daiBalance = await contracts.DAI.functions.balanceOf(userAddress);
        let wethBalance = await contracts.WETH.functions.balanceOf(userAddress);
        let balances = {ETH: ethers.utils.formatEther(ethBalance.toString()), WETH: ethers.utils.formatEther(wethBalance.toString()), DAI: ethers.utils.formatEther(daiBalance.toString())};
        setUserBalances(balances);
        if (hasProxy) {
            let daiAllowance = await contracts.DAI.functions.allowance(address, predicted[0]);
            let wethAllowance = await contracts.WETH.functions.allowance(address, predicted[0]);
            let allowances = {DAI: ethers.utils.formatEther(daiAllowance.toString()), WETH: ethers.utils.formatEther(wethAllowance.toString())};
            setProxyAllowance(allowances);
        }
    }
  }, 3000);

  return (
    <div>
    {isLoaded ?
        <div>
            <h1>
                &nbsp;<FormattedMessage {...messages.header} />
            </h1>
            <div>
                <div className="borderedSquare centered">
                    {isConnected ?
                        <span>
                            <h2><FormattedMessage {...messages.walletHeader} /></h2>
                            <p><FormattedMessage {...messages.addressLabel} />:&nbsp;{userAddress.substring(0, 7)+'...'}</p>
                            <p>ETH:&nbsp;{userBalances.ETH}</p>
                            <p>DAI:&nbsp;{userBalances.DAI}</p>
                            <p>WETH:&nbsp;{userBalances.WETH}</p>
                        </span>
                    :
                        <p>
                            <br></br>
                            <button onClick={handleConnectWallet}><FormattedMessage {...messages.connectWallet} /></button>
                        </p>
                    }
                </div>
                <div className="borderedSquare centered">
                    {isConnected ?
                        <span>
                        {hasProxy ?
                            <span>
                                <p><FormattedMessage {...messages.haveProxy} /> <span className="green">✔</span></p>
                                <p>DAI <FormattedMessage {...messages.allowance} />: {proxyAllowance.DAI}</p>
                                <p>WETH <FormattedMessage {...messages.allowance} />: {proxyAllowance.WETH}</p>
                                <br></br>
                                <p><FormattedMessage {...messages.amount} />:<input type="text" size="6" id="daiAllowance"></input> <button onClick={handleApproveDai}><FormattedMessage {...messages.approve} /> DAI</button></p>
                                <p>{approveDaiProgress} {approveDaiTx!="" ? <a className="classicLink" href={'https://rinkeby.etherscan.io/tx/'+approveDaiTx.toString()}>view tx</a>:<span></span>}</p>
                            </span>
                            :
                            <span>
                                <br></br>
                                <p><button onClick={handleGetProxy}><FormattedMessage {...messages.getProxy} /></button></p>
                                <p>{createProxyProgress} {createProxyTx!="" ? <a className="classicLink" href={'https://rinkeby.etherscan.io/tx/'+createProxyTx.toString()}>view tx</a>:<span></span>}</p>
                            </span>
                        }
                        </span>
                    :
                        <div className="greySquare"></div>
                    }
                </div>
                <div className="borderedSquare centered">
                    {isConnected ?
                        <span>
                        {isRunningTaskLoop ?
                            <span>
                                <p><FormattedMessage {...messages.traderRunning} /></p>
                                <p><button><FormattedMessage {...messages.traderStop} /></button></p>
                            </span>
                        :
                            <span>
                                <p><FormattedMessage {...messages.traderHeader} /></p>
                                <p><FormattedMessage {...messages.amount} />:<input type="text" size="6" id="amountPerTrade"></input></p>
                                <p><FormattedMessage {...messages.seconds} />:<input type="text" size="6" id="delayLength"></input></p>
                                <p><button><FormattedMessage {...messages.traderStart} /></button></p>
                            </span>
                        }
                        </span>
                    :
                        <div className="greySquare"></div>
                    }
                </div>
            </div>
        </div>
    :
        <div>loading...</div>
    }
    </div>
  );
}
