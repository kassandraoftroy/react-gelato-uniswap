import React from 'react';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateProxyStep = props => {
    return (
        <div className="centered">
            <hr />
            <h2><FormattedMessage {...messages.proxyHeader} /></h2>
            <p><strong><FormattedMessage {...messages.stepHeader} /></strong> <FormattedMessage {...messages.step} /></p>
            {props.isConnected ?
                <span>
                {props.isProxyLoaded ?
                    <div>
                        <hr />
                        <p><FormattedMessage {...messages.haveProxy} /> <span className="green">✔</span></p>
                        <p>DAI <FormattedMessage {...messages.allowanceHeader} />: {props.proxyAllowance.DAI}</p>
                        <p>WETH <FormattedMessage {...messages.allowanceHeader} />: {props.proxyAllowance.WETH}</p>
                        <p><button className='btn btn-primary btn-block customButton' onClick={props.nextStep}><FormattedMessage {...messages.continue} /></button></p>
                    </div>
                    :
                    <div>
                        <hr />
                        <button className='btn btn-primary btn-block customButton' onClick={props.createProxyHandler}><FormattedMessage {...messages.createProxy} /></button>
                        <br></br>
                        <p>{props.createProxyProgress} {props.createProxyTx!="" ? <a className="classicLink" href={'https://rinkeby.etherscan.io/tx/'+props.createProxyTx}>view tx</a>:<span></span>}</p>
                    </div>
                }
                </span>
            :
                <div>
                    <hr />
                    <p><strong><FormattedMessage {...messages.goBackHeader} /></strong></p>
                    <p><button className='btn btn-primary btn-block customButton' onClick={() => props.goToStep(1)}><FormattedMessage {...messages.goBack} /></button></p>
                </div>
            }
        </div>
    );
};

export default CreateProxyStep;