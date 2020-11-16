import React from 'react';
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import 'bootstrap/dist/css/bootstrap.min.css';

const ScheduleUniswapStep = props => {
    return (
        <div className="centered">
            <hr />
            <h2><FormattedMessage {...messages.uniswapHeader} /></h2>
            <p><strong><FormattedMessage {...messages.stepHeader} /></strong> <FormattedMessage {...messages.step} /></p>
            {props.isConnected ?
                <span>
                {props.isProxyLoaded ?
                    <span>
                        <hr />
                        {!props.isSubmitTask && !props.isCancelTask ?
                            <div>
                                <p><button className='btn btn-primary btn-block customButton' onClick={props.switchSubmitTask}><FormattedMessage {...messages.submitTask} /></button></p>
                                <p><button className='btn btn-primary btn-block customButton' onClick={props.switchCancelTask}><FormattedMessage {...messages.cancelTask} /></button></p>
                            </div>
                        :
                            <span></span>
                        }
                        {props.isSubmitTask ?
                            <div>
                                <p><strong><FormattedMessage {...messages.amountHeader} /></strong> <input className='customInput' type="text" size="6" onChange={props.amountHandler}></input></p>
                                <p><strong><FormattedMessage {...messages.delayHeader} /></strong> <input className='customInput' type="text" size="6" onChange={props.delayHandler}></input></p>
                                <p><button className='btn btn-primary btn-block customButton' onClick={props.submitTaskHandler}><FormattedMessage {...messages.submit} /></button></p>
                                <p><button className='btn btn-primary btn-block customButton' onClick={props.switchSubmitTask}><FormattedMessage {...messages.goBack} /></button></p>
                            </div>
                        :
                            <span></span>
                        }
                        {props.isCancelTask ?
                            <div>
                                <p><strong><FormattedMessage {...messages.taskReceiptHeader} /></strong></p>
                                <p><textarea className='customTextarea' type="text" onChange={props.taskReceiptHandler}></textarea></p>
                                <p><button className='btn btn-primary btn-block customButton' onClick={props.cancelTaskHandler}><FormattedMessage {...messages.cancel} /></button></p>
                                <p><button className='btn btn-primary btn-block customButton' onClick={props.switchCancelTask}><FormattedMessage {...messages.goBack} /></button></p>
                            </div>
                        :
                            <span></span>
                        }
                        <hr />
                        <p>{props.submitTaskProgress.length>200 ? <span className="mini">{props.submitTaskProgress}</span>:<span>{props.submitTaskProgress}</span>} {props.submitTaskTx!="" ? <a href={'https://rinkeby.etherscan.io/tx/'+props.submitTaskTx.toString()}>view tx</a>:<span></span>}</p>
                    </span>
                    :
                    <div>
                        <hr />
                        <p><strong><FormattedMessage {...messages.goBackProxy} /></strong></p>
                        <button className='btn btn-primary btn-block customButton' onClick={() => props.goToStep(2)}><FormattedMessage {...messages.goBack} /></button>
                    </div>
                }
                </span>
            :
                <div>
                    <hr />
                    <p><strong><FormattedMessage {...messages.goBackWallet} /></strong></p>
                    <button className='btn btn-primary btn-block customButton' onClick={() => props.goToStep(1)}><FormattedMessage {...messages.goBack} /></button>
                </div>
            }
        </div>
    );
};

export default ScheduleUniswapStep;