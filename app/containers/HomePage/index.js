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

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [userSigner, setUserSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [userProvider, setUserProvider] = useState(null);
  const [userEthBalance, setUserEthBalance] = useState("");

  const handleConnectWallet = async (_e) => {
    try {
        await window.ethereum.enable();
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = provider.getSigner();
        let address = await signer.getAddress();
        let balance = await provider.getBalance(address);
        setUserProvider(provider);
        setUserSigner(signer);
        setUserAddress(address);
        setUserEthBalance(ethers.utils.formatEther(balance));
        setIsConnected(true);
    } catch(e) {
        console.log('error finding metamask:', e.message);
        setIsConnected(false);
    }
  }

  return (
    <div>
        <h1>
            &nbsp;<FormattedMessage {...messages.header} />
        </h1>
        <div className="borderedSquare centered">
            {isConnected ?
                <span>
                    <h2><FormattedMessage {...messages.walletHeader} /></h2>
                    <p><FormattedMessage {...messages.addressLabel} />:&nbsp;{userAddress}</p>
                    <p>ETH:&nbsp;{userEthBalance}</p>
                </span>
            :
                <p>
                    <br></br><br></br><br></br>
                    <button onClick={handleConnectWallet}><FormattedMessage {...messages.connectWallet} /></button>
                </p>
            }
        </div>
    </div>
  );
}
