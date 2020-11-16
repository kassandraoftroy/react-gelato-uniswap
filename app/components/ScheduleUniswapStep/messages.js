import { defineMessages } from 'react-intl';

export const scope = 'gelatoDapp.components.ScheduleUniswapStep';

export default defineMessages({
  uniswapHeader: {
    id: `${scope}.uniswapHeader`,
    defaultMessage: 'Gelato Uniswap',
  },
  step: {
    id: `${scope}.step`,
    defaultMessage: 'Sumbit a Uniswap task for Gelato to execute on an infinite loop',
  },
  stepHeader: {
    id: `${scope}.stepHeader`,
    defaultMessage: 'Step 3:',
  },    
  goBackWallet: {
    id: `${scope}.goBackWallet`,
    defaultMessage: 'You must connect a wallet first',        
  },
  goBackProxy: {
    id: `${scope}.goBackProxy`,
    defaultMessage: 'You must create a gelato proxy first',       
  },
  goBack: {
    id: `${scope}.goBack`,
    defaultMessage: 'go back',       
  },
  submitTask: {
    id: `${scope}.submitTask`,
    defaultMessage: 'submit a task',
  },
  cancelTask: {
    id: `${scope}.goBack`,
    defaultMessage: 'cancel a task',
  },
  submit: {
    id: `${scope}.submit`,
    defaultMessage: 'submit',
  },
  amountHeader: {
    id: `${scope}.amountHeader`,
    defaultMessage: 'DAI Amount Per Trade:',
  },
  delayHeader: {
    id: `${scope}.delayHeader`,
    defaultMessage: 'Delay (in seconds):',
  },
  cancel: {
    id: `${scope}.cancelTask`,
    defaultMessage: 'cancel task', 
  },
  taskReceiptHeader: {
      id: `${scope}.taskReceiptHeader`,
      defaultMessage: 'Task Receipt',
  }
});