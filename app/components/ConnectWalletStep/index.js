import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import 'bootstrap/dist/css/bootstrap.min.css';

const ConnectWalletStep = props => {
    return (
        <div className="centered">
            <hr />
            <h2><FormattedMessage {...messages.walletHeader} /></h2>
            <p><strong><FormattedMessage {...messages.stepHeader} /></strong> <FormattedMessage {...messages.step} /></p>
            {props.isConnected ?
                <div>
                    <hr />
                        <p><strong><FormattedMessage {...messages.addressHeader} /></strong> <span className="small">{props.userAddress}</span></p>
                        <p><strong>ETH:</strong>&nbsp;{props.userBalances.ETH}</p>
                        <p><strong>DAI:</strong>&nbsp;{props.userBalances.DAI}</p>
                        <p><strong>WETH:</strong>&nbsp;{props.userBalances.WETH}</p>
                        <p><button className='btn btn-primary btn-block customButton' onClick={props.nextStep}><FormattedMessage {...messages.continue} /></button></p>
                </div> 
            :
                <div>
                    <hr />
                    <p><button className='btn btn-primary btn-block customButton' onClick={props.walletHandler}><FormattedMessage {...messages.connectWallet} /></button></p>
                </div>
            }
        </div>
    );
};

export default ConnectWalletStep;