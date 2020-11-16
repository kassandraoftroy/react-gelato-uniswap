import { defineMessages } from 'react-intl';

export const scope = 'gelatoDapp.components.CreateProxyStep';

export default defineMessages({
    proxyHeader: {
        id: `${scope}.proxyHeader`,
        defaultMessage: 'Proxy',
    },
    haveProxy: {
        id: `${scope}.haveProxy`,
        defaultMessage: 'You have a Gelato Proxy',
    },
    allowanceHeader: {
        id: `${scope}.allowanceHeader`,
        defaultMessage: 'Allowance',
    },
    continue: {
        id: `${scope}.continue`,
        defaultMessage: 'continue',
    },
    stepHeader: {
        id: `${scope}.stepHeader`,
        defaultMessage: 'Step 2:',   
    }, 
    step: {
        id: `${scope}.step`,
        defaultMessage: 'Create your Gelato User Proxy',        
    },
    createProxy: {
        id: `${scope}.createProxy`,
        defaultMessage: 'create proxy',
    },
    goBackHeader: {
        id: `${scope}.goBackHeader`,
        defaultMessage: 'You must connect a wallet first',        
    },
    goBack: {
        id: `${scope}.goBack`,
        defaultMessage: 'go back',       
    },
});