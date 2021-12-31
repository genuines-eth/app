import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import logo from './logo.svg';
import './App.css';
import AppBar from './app/AppBar';
//import RequireAuth from './features/requireAuth/RequireAuth';
import OEMs from "./routes/oems";


// todo install import "react-native-get-random-values" ?
import "@ethersproject/shims" // before ethers! see https://docs.ethers.io/v5/cookbook/react-native/
import { ethers } from 'ethers';
// import { FormatTypes } from '@ethersproject/abi';

import { Wallet } from './features/wallet/Wallet';
import ViewContactUs from './app/ViewContactUs';
import ViewHowItWorks from './app/ViewHowItWorks'

function App() {

  let [provider,/* setProvider*/] = useState<ethers.providers.JsonRpcProvider>();
  let [blockNumber, setBlockNumber] = useState<number>();

  let [contract1, /*setContract1*/] = useState<ethers.Contract>();

  useEffect(() => {
    const init = () => {
      console.log('init: setting a provider');
      /*const prov = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
      setProvider(prov);
      console.log('init: set a provider');*/
      /*
      const contr = new ethers.Contract('0x2aD7444F5E3094CEf8c81e63716a40E2221Ee2b5', contract1Abi, prov);
      setContract1(contr);
      console.log(`contract got functions=${contr.interface.format(FormatTypes.minimal)}`);
      */
    }
    init();

  }, []);

  useEffect(() => {
    /* if we want to query it directly
    const getBlockNumber = async (provider: ethers.providers.JsonRpcProvider) => {
      setBlockNumber(await provider?.getBlockNumber());
    }*/
    if (provider) {
      // getBlockNumber(provider);
      provider.on("block", (blockNumber) => {
        setBlockNumber(blockNumber);
      });
    }
    return () => {
      if (provider) {
        provider?.off("block");
        console.log(`deregistered a on block`);
      }
    }
  }, [provider]);

  let [uri, setUri] = useState<string>('no uri');

  useEffect(() => {
    if (contract1) {
      const getUri = async (contract: ethers.Contract, id: BigInt) => {
        const aUri = await contract.uri(id);
        setUri(aUri);
        console.log(`called setUri(${aUri}`);
      }
      const getBalance = async (contract: ethers.Contract) => {
        const aBalance = await contract.balanceOf('0xDc847402DD44ea22828531d163dCa7E40D45c68e', 1n);
        console.log(`got balance = ${aBalance}`);
      }

      getUri(contract1, 1n);
      getBalance(contract1);
    }
  }, [contract1]);


  return (
    <BrowserRouter>
    <div className="App">
      <header className="App-header">
          <AppBar />
          {false && <img src={logo} className="App-logo" alt="logo" />}
        </header>
          <Routes>
            <Route path="/" element={
              <ViewHowItWorks />
            } />
          <Route path="oems/*"
              element={
                < OEMs />
              }
            />
            <Route path="*" element={
              < main style={{ padding: "1rem" }}>
                <p>There's nothing here for '{window.location.pathname}' yet!</p>
              </main>
            } />
          </Routes>
          <ViewContactUs />
          {false && <p>
            Got {provider ? ' a provider' : 'no provider yet!'}.
            {blockNumber && ` Got ${blockNumber} as last block number.`}
            Uri = '{uri}'
          </p>}
          <nav
            style={{
              borderBottom: "solid 1px",
              paddingBottom: "1rem"
            }}
          >
            { /* <Link to="/oems">OEMs</Link> | { " "}
              < Link to="/products">Products</Link> */}
          </nav>
          {false && <Wallet />}


    </div>
    </BrowserRouter>
  );
}

export default App;
