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

const STATIC_SALT = 1234567; // Static Salt For Dynamic

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasProxy, setHasProxy] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [userBalances, setUserBalances] = useState(null);
  const [proxyAllowance, setProxyAllowance] = useState(null);
  const [contracts, setContracts] = useState(null);

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
        console.log('error initializing wallet:', e.message);
        setIsConnected(false);
    }
  }

  const handleGetProxy = async (_e) => {
      console.log("hadnling...");
  }

  const load = async () => {
    try {
        setIsLoaded(true);
    } catch(e) {
        console.log("error loading:", e.message);
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
    }
  }, 3000);

  return (
    <div>
    {isLoaded ?
        <div>
            <h1>
                &nbsp;<FormattedMessage {...messages.header} />
            </h1>
            <div className="borderedSquare centered">
                {isConnected ?
                    <span>
                        <h2><FormattedMessage {...messages.walletHeader} /></h2>
                        <p><FormattedMessage {...messages.addressLabel} />:&nbsp;{userAddress.substring(0, 7)+'...'}</p>
                        <p>ETH:&nbsp;{userBalances.ETH}</p>
                        <p>DAI:&nbsp;{userBalances.DAI}</p>
                        <p>WETH:&nbsp;{userBalances.WETH}</p>
                        {hasProxy ?
                            <span>
                                <p>You have a Gelato Proxy <span className="green">✔</span></p>
                                <p>Proxy DAI Allowance: {proxyAllowance}</p>
                            </span>
                        :
                            <span>
                                <br></br>
                                <p><button onClick={handleGetProxy}>Get A Proxy</button></p>
                            </span>
                        }
                    </span>
                :
                    <p>
                        <br></br><br></br><br></br>
                        <button onClick={handleConnectWallet}><FormattedMessage {...messages.connectWallet} /></button>
                    </p>
                }
            </div>
        </div>
    :
        <div>loading...</div>
    }
    </div>
  );
}
