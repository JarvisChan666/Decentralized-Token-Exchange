import React, { useEffect } from'react';
//import  { ethers } from 'ethers';
import config from '../config.json'
import { useDispatch } from 'react-redux';

import { 
  loadProvider, 
  loadNetworks, 
  loadAccounts,
  loadTokens,
  loadExchange
} from '../store/interaction';

function App() {
 
  const dispatch = useDispatch();
  const loadBlockchainData = async () => {
    // Connect ethers to blockchain
    const provider = await loadProvider(dispatch)

    // Fetch current network's chainId (eg: hardhat 31337)
    const chainId  = await loadNetworks(provider, dispatch);
   
    // Fetch current account & balance from MetaMask
    await loadAccounts(provider, dispatch)

    // Load token Smart Contract
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address] , dispatch) 
    
    // load Exchange Smart Contract
    const exchange = config[chainId].exchange
    await loadExchange(provider, exchange.address, dispatch)
  
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;



