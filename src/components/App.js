import React, { useEffect } from'react';
//import  { ethers } from 'ethers';
import config from '../config.json'
import { useDispatch } from 'react-redux';

import { 
  loadProvider, 
  loadNetworks, 
  loadAccounts,
  loadToken } from '../store/interaction';

function App() {
 
  const dispatch = useDispatch();
  const loadBlockchainData = async () => {
    await loadAccounts(dispatch)

    // Connect ethers to blockchain
    const provider = await loadProvider(dispatch)
    const chainId  = await loadNetworks(provider, dispatch);
   

    // Token Smart Contract
    await loadToken(provider, config[chainId].DApp.address, dispatch) 
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