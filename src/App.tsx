import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import logo from './logo.svg';
import './App.css';
import AppBar from './app/AppBar';
import RequireAuth from './features/requireAuth/RequireAuth';
import OEMs from "./routes/oems";


// todo install import "react-native-get-random-values" ?
import "@ethersproject/shims" // before ethers! see https://docs.ethers.io/v5/cookbook/react-native/
import { ethers } from 'ethers';
import { FormatTypes } from '@ethersproject/abi';

import { Wallet } from './features/wallet/Wallet';
import ViewContactUs from './app/ViewContactUs';
import ViewHowItWorks from './app/ViewHowItWorks'

const contract1Abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "TransferBatch",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "TransferSingle",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "value",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "URI",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "attributes",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "accounts",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      }
    ],
    "name": "balanceOfBatch",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeBatchTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "uri",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {

  let [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();
  let [blockNumber, setBlockNumber] = useState<number>();

  let [contract1, setContract1] = useState<ethers.Contract>();

  useEffect(() => {
    const init = () => {
      console.log('init: setting a provider');
      const prov = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
      setProvider(prov);
      console.log('init: set a provider');
      const contr = new ethers.Contract('0x2aD7444F5E3094CEf8c81e63716a40E2221Ee2b5', contract1Abi, prov);
      setContract1(contr);
      console.log(`contract got functions=${contr.interface.format(FormatTypes.minimal)}`);

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
            <Route path="oems"
              element={
                <RequireAuth redirectTo="/connect">
                  <OEMs />
                </RequireAuth>
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
