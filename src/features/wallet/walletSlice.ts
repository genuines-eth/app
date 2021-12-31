import { createSlice, createAsyncThunk, PayloadAction, /*PayloadAction*/ } from '@reduxjs/toolkit'
import { ethers } from 'ethers';
//import { WebsocketProvider } from 'web3-providers-ws';
import Contract1OEM from '../../Contract1OEM.json';
import Contract2Product from '../../Contract2Product.json';
import Contract3ProductInstance from '../../Contract3ProductInstance.json';
import { store } from '../../app/store'

const Web3WsProvider = require('web3-providers-ws');

// todo use https://github.com/ensdomains/web3modal for wallet

export interface BlockChainData {
    blockNumber: number,
    networkName: string,
    networkChainId: number,
    networkEnsAddress?: string,
}

export interface ContractData {
    address: string,
    abi: any,
    contractName: string,
    addName: string,
    parentAddressFunction?: string,
    parentAddress?: string,
    contractURI?: string,
    parentTokenFunction?: string,
    minterFunction?: string,
    contractAttributesMap?: any,
    requiresAttestation?: boolean,
    data?: any
}

export interface AttestationData {
    method: string
}

interface ContractDataMap { [contractAddr: string]: ContractData }

interface TokenMap { [contractAddr: string]: string[] } // just a string with the address-id

export interface TokenData {
    id: string,
    uri: string,
    parentId?: string, // address-id of the parent token
    attestationData?: AttestationData,
    data?: any
}

interface TokenDataMap { [tokenAddr: string]: TokenData } // tokenAddr as address-id

export interface WalletState {
    pendingRequests: number, // if >0 a spinner should popup
    isConnected: boolean,
    address: string,
    tokens: TokenMap,
    contractsData: ContractDataMap,
    tokensData: TokenDataMap,
    blockChainData: BlockChainData,
}

export const accountProvider = new ethers.providers.Web3Provider((window as any).ethereum, "any");

const web3WsProvider = new Web3WsProvider("ws://localhost:8546", {
    clientConfig: {
        keepalive: true,
        keepaliveInterval: 60000, // ms
    },
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
});
console.log(`web3WsProvider=`, web3WsProvider);

export const contractProvider = new ethers.providers.Web3Provider(web3WsProvider);
try {
    contractProvider.getNetwork().then((network) => {
        store.dispatch(walletSlice.actions.updateBlockChainData({
            networkName: network.name, networkChainId: network.chainId, netWorkEnsAddress: network.ensAddress
        }))
        console.log(`contractProvider connected to ${network?.name} chainId=${network?.chainId}`)
    });
} catch (e) {
    console.warn(`contractProvider querying network got error:${e}`)
}
contractProvider.on("block", (...args) => {
    // console.log(`contractProvider on blocks returned ${JSON.stringify(args)}`);
    store.dispatch(walletSlice.actions.updateBlockChainData({ blockNumber: args[0] }));
});

const initialState: WalletState = {
    pendingRequests: 0,
    isConnected: false,
    address: '',
    blockChainData: {
        blockNumber: 0,
        networkChainId: contractProvider.network?.chainId || 0,
        networkName: contractProvider.network?.name || "unknown network",
        networkEnsAddress: contractProvider.network?.ensAddress,
    },
    tokens: {},
    tokensData: {},
    contractsData: {
        '0xb76118f5FA3B7bA7b139eA14BAefCdE30Fd705EE': {
            address: '0xb76118f5FA3B7bA7b139eA14BAefCdE30Fd705EE',
            abi: Contract1OEM.abi,
            contractName: Contract1OEM.contractName,
            addName: 'brand',
            requiresAttestation: true,
        },
        '0x73EAaB444Ef8917d17cAe22ed71d678145873A0C': {
            address: '0x73EAaB444Ef8917d17cAe22ed71d678145873A0C',
            abi: Contract2Product.abi,
            contractName: Contract2Product.contractName,
            addName: 'product type',
            parentAddressFunction: '_contractOemAddr',
            parentTokenFunction: 'oems',
            minterFunction: 'mintProduct',
            contractAttributesMap: {
                "n": "name",
                "u": "external_link",
                "d": "description",
                "i": "image"
            }
        },
        '0xd130569d40BE52F476767F340676C8515E4FB35b': {
            address: '0xd130569d40BE52F476767F340676C8515E4FB35b',
            abi: Contract3ProductInstance.abi,
            contractName: Contract3ProductInstance.contractName,
            addName: '#serial / product',
            parentAddressFunction: '_contractProductAddr',
            parentTokenFunction: 'products',
            minterFunction: 'mintProduct',
            contractAttributesMap: {
                "n": "name",
                "u": "external_link",
                "d": "description",
                "i": "image"
            }
        }
    },
}

const loadContractsDetails = createAsyncThunk('wallet/loadContractsDetails',
    async (arg: string, thunkApi) => {
        console.log(`loadContractDetails(${arg})...querying etherscan...`);
        try {
            let { wallet } = (thunkApi.getState() as { wallet: { contractsData: any } });
            let contractsData = JSON.parse(JSON.stringify(wallet.contractsData));
            /*contractProvider.on("block", (...args) => {
                console.log(`contract on blocks returned ${JSON.stringify(args)}`);
            });*/

            for (let contractDataObj of Object.values(contractsData)) {
                let contractData = contractDataObj as ContractData;
                console.log(`loadContractsDetails(${arg})... querying contractName='${contractData.contractName}'`);
                //await delay(1000); // 5api calls/s... todo find a better way
                let contract = new ethers.Contract(contractData.address, contractData.abi, contractProvider);
                // query uri:
                try {

                    // notify for all events:
                    contract.on(contract.filters.TransferSingle(), (...args) => {
                        console.log(`contract ${contractData.contractName} event: TransferSingle... returned ${JSON.stringify(args)}`);
                    });
                    contract.on(contract.filters.TransferBatch(), (...args) => {
                        console.log(`contract ${contractData.contractName} event: TransferBatch... returned ${JSON.stringify(args)}`);
                    });

                    let contractURI;
                    try {
                        contractURI = await contract.functions['contractURI']();
                        console.log(`loadContractsDetails(${arg})... returned ${JSON.stringify(contractURI)}`);
                        contractData.contractURI = contractURI;
                    } catch (err) {
                        if (contractData.contractName === "Contract1OEM" && contractData.address === '0xb76118f5FA3B7bA7b139eA14BAefCdE30Fd705EE') {
                            // hack as first contract didnt had that function. provide static data
                            contractURI = "https://mcbehr.de/genuines/api/c1/metadata.json";
                        } else throw err;
                    }
                    // parent?
                    try {
                        if (contractData.parentAddressFunction && contractData.parentAddressFunction.length > 0) {
                            let parentAddr = await contract.functions[contractData.parentAddressFunction]();
                            console.log(`loadContractsDetails(${arg}) parentAddress returned ${JSON.stringify(parentAddr)}`);
                            contractData.parentAddress = parentAddr[0]; // strangely an array
                        }
                    } catch (err) {
                        // ignore for now as long as the names are not consistent
                        console.error(`loadContractsDetails(${arg}) parent got err='${err}'`);
                    }

                    console.log(`loadContractsDetails fetching uri=${contractURI}...`);
                    let res = await fetch(contractURI, { method: 'GET', mode: 'cors' });
                    console.log(`loadContractsDetails got res=${res.status} res.ok=${res.ok} res.statusText='${res.statusText}'`);
                    if (res.ok) {
                        res = await res.json();
                        console.log(`loadContractsDetails got data=${JSON.stringify(res)}`);
                        contractData.data = res;
                    }
                } catch (err) {
                    console.error(`loadContractsDetails for '${contractData.contractName}' got err=${err}`);
                }
            }
            console.log(`loadContractsDetails(${arg})... for loop done. len=${Object.keys(contractsData).length}`);
            thunkApi.dispatch(loadTokensFor({ addr: arg, contractsData: contractsData }));
            return contractsData;
        } catch (err) {
            console.error(`loadContractsDetails got err=${err}`);
        }
    }
)

const loadTokensFor = createAsyncThunk('wallet/loadTokensFor',
    async (data: { addr: string, contractsData: any }, thunkApi) => {
        try {
            let tokensToRet: TokenMap = {};
            const addr = data.addr;
            console.log(`loadTokensFor(${addr})...querying etherscan for all contracts...`);
            for (let contractDataObj of Object.values(data.contractsData)) {
                let contractData = contractDataObj as ContractData;
                console.log(`loadTokensFor(${data.addr})... querying contractName='${contractData.contractName}'`);
                let contract = new ethers.Contract(contractData.address, contractData.abi, contractProvider);

                const eventFilter = contract.filters.TransferSingle();
                let events = await contract.queryFilter(eventFilter); // todo move to the server to avoid leaking the api keys and keeping a full history...
                // todo and filter for TransferBatch...
                console.log(`loadTokensFor(${addr})... returned ${events.length} events: ${JSON.stringify(events)}`);
                for (let i = 0; i < events.length; ++i) {
                    const event = events[i];
                    switch (event.event) {
                        case 'TransferSingle':
                            if (event.args && event.args.length >= 4 && event.args?.[2] === addr) {
                                console.log(`loadTokensFor: adding ${event.args[3]} from event: ${JSON.stringify(event)}`);
                                if (!(contract.address.toString() in tokensToRet)) {
                                    tokensToRet[contract.address.toString()] = [];
                                }
                                tokensToRet[contract.address.toString()].push(contract.address.toString() + '-' + event.args[3].toHexString());
                                // todo they might have been transferred to somebody else later... 
                            } else {
                                console.log(`loadTokensFor: ignoring event due to diff addr: ${JSON.stringify(event)}`);
                            }
                            break;
                        default:
                            console.warn(`loadTokensFor: unknown event: ${JSON.stringify(event)}`);
                            break;
                    }
                }
            }
            console.log(`loadTokensFor(${addr})... returned tokens: ${JSON.stringify(tokensToRet)}`);
            return tokensToRet;
        } catch (err) {
            console.log(`loadTokensFor(${data.addr})...querying etherscan... got err=${err}`);
        }
    }
);

async function autoRetry<Arg1T>(fn: Function, a1: Arg1T, ...args: any[]) {
    while (true) {
        try {
            return await fn(a1, args);
        } catch (err: any) {
            if (err.status !== 403) {
                console.warn(`autoRetry got err=${JSON.stringify(err)}`);
                throw err;
            } else {
                console.warn(`autoRetry delaying a bit`);
                await delay(500);
            }
        }
    }

}

export const loadTokenDataFor = createAsyncThunk('wallet/loadTokenDataFor',
    async (data: { tokenId: string }, thunkApi) => {
        console.log(`loadTokenDataFor(${data.tokenId})...`);
        // we reload in any case the data. // todo except if already pending...
        const state = thunkApi.getState() as any;
        const contractsData = state.wallet.contractsData; // todo if !undefined
        // console.log(`loadTokenDataFor(${data.tokenId})... contractsData=${JSON.stringify(contractsData)}`);

        const tokenParts = data.tokenId.split('-');
        const contractAddr = tokenParts[0];
        const id = tokenParts[1];

        let tokenData: TokenData = {
            id: data.tokenId,
            uri: '',
        }

        if (contractAddr.length > 0 && id.length > 0 && Object.keys(contractsData).length > 0) {
            try {
                // query contract:
                // console.log(`TokenCard querying contract.uri for ${contractAddr}-${tokenId}`);
                //await delay(1000); // todo find better way for the 5 api calls/s
                const contract1 = new ethers.Contract(contractAddr, contractsData[contractAddr].abi, contractProvider);
                const anUri = await autoRetry(contract1.uri, ethers.BigNumber.from(id)); // contract1.uri(id);
                tokenData.uri = anUri.replace('{id}', id);
                console.log(`loadTokenDataFor got uri=${anUri}`);

                // parent?
                if (contractsData[contractAddr].parentTokenFunction) {
                    if (!contractsData[contractAddr].parentAddress) {
                        console.warn(`loadTokenDataFor missing parentAddress!`, contractsData[contractAddr]);
                    }
                    // query contract for parent token:
                    const parentTokenId = await autoRetry(contract1.functions[contractsData[contractAddr].parentTokenFunction], ethers.BigNumber.from(id));
                    console.log(`loadTokenDataFor got parentTokenId=${JSON.stringify(parentTokenId)}`);
                    tokenData.parentId = `${contractsData[contractAddr].parentAddress}-${parentTokenId[0].toHexString()}`;
                    console.log(`loadTokenDataFor got parentId=${tokenData.parentId}`);
                }

                const res = await fetch(tokenData.uri, { method: 'GET', mode: 'cors' });
                console.log(`loadTokenDataFor got res=${res.status} res.ok=${res.ok} res.statusText='${res.statusText}'`);
                if (res.ok) {
                    const data = await res.json();
                    console.log(`loadTokenDataFor got data=${JSON.stringify(data)}`);
                    tokenData.data = data;
                    return tokenData;
                }
            } catch (err) {
                console.error(`loadTokenDataFor got err=${JSON.stringify(err)}`);
            }
        }
    }
);

function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

/**
 * perform a mapping/conversion of data attributes returned by the uri to the 
 * contract attributes we do store in the contract.
 * 
 * @param contract 
 * @param data json object. Only known attributes are mapped. empty strings or null values are ignored
 */

function mapToContractAttributes(contract: ContractData, data: any): string {
    if (contract.contractAttributesMap) {
        const map = contract.contractAttributesMap;

        const objToRet: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (!value || (typeof value === "string" && value.length === 0)) continue;
            // we do need to iterate through each... could be optimized by a reverse map
            for (const [ck, dk] of Object.entries(map)) {
                if (key === dk) {
                    // could change values here as well, e.g. remove https:// at start for u
                    objToRet[ck] = value;
                }
            }
        }
        return JSON.stringify(objToRet);
    } else return JSON.stringify(data);
}

/**
 * mintNewToken
 * Execute contract to mint a new brand/product/instance (=token).
 * The data is identified by a prev. addTempTokenData
 */
export const mintNewToken = createAsyncThunk('wallet/mintNewToken',
    async (arg: { tempTokenId: string, onFulfilled: () => void }, thunkApi) => {
        console.log(`wallet/mintNewToken called for tempTokenId=${arg.tempTokenId}`);

        //await window.ethereum.enable();
        const accountProvider = new ethers.providers.Web3Provider((window as any).ethereum, "rinkeby"); // todo
        await accountProvider.send("eth_requestAccounts", []);
        const signer = accountProvider.getSigner();
        const minterAddr = await signer.getAddress();

        const tokenParts = arg.tempTokenId.split('-');
        const contractAddr = tokenParts[0];

        // we call "minterFunction" with to, productId, data
        // todo find a way to handle different params, e.g. for contract1
        const contractsData: ContractDataMap = (thunkApi.getState() as any).wallet.contractsData;
        const tokensData: TokenDataMap = (thunkApi.getState() as any).wallet.tokensData;
        const contract = contractsData[contractAddr];
        const token = tokensData[arg.tempTokenId];
        const parentId = token.parentId || "0-0x0";
        const parentTokenRealId = parentId.split('-')[1];
        const contractAttributes = mapToContractAttributes(contract, token.data);

        console.log(`wallet/mintNewToken calling contract.name=${contract.contractName}, token.id=${token.id} .parentId=${token.parentId} .parentTokenRealId=${parentTokenRealId}`);
        if (!contract.minterFunction) throw new Error("wallet/mintNewToken: no minterFunction!");
        const ethersContract = new ethers.Contract(contract.address, contract.abi, signer);

        const network = await accountProvider.getNetwork();
        console.log(`accountProvider got network=${JSON.stringify(network)}`);


        //const res = await ethersContract.functions[contract.minterFunction](minterAddr, parentTokenRealId, contractAttributes);
        try {
            if (false) {
                console.log(`wallet/mintNewToken calling estimateGas.${contract.minterFunction}(${minterAddr}, ${parentTokenRealId}, "${contractAttributes}")`);
                const res = await ethersContract.estimateGas.mintProduct(minterAddr, parentTokenRealId, contractAttributes);
                console.log(`wallet/mintNewToken contract estimateGas ${contract.minterFunction}(${minterAddr}, ${parentTokenRealId}, "${contractAttributes}") returned ${res.toBigInt()}`);
            }
        } catch (err) {
            console.log(`wallet/mintNewToken contract estimateGas failed with err=${err}`);
        }

        console.log(`wallet/mintNewToken calling mintProduct.${contract.minterFunction}(${minterAddr}, ${parentTokenRealId}, "${contractAttributes}")`);
        const res2 = await ethersContract.mintProduct(minterAddr, parentTokenRealId, contractAttributes);
        console.log(`wallet/mintNewToken contract mintProduct ${contract.minterFunction}(${minterAddr}, ${parentTokenRealId}, "${contractAttributes}") returned ${JSON.stringify(res2)}`);

        // await delay(2000);
        arg.onFulfilled(); // todo is this allowed???
        return { tempTokenId: arg.tempTokenId, contractRes: JSON.stringify(res2) };
        // e.g. {"hash":"0x007a5b1c7391d69e5c2565afbb0232479a6e1f833276ad3f18fb4e2d0fe5755d","type":2,"accessList":null,"blockHash":null,"blockNumber":null,"transactionIndex":null,"confirmations":0,"from":"0xDc847402DD44ea22828531d163dCa7E40D45c68e","gasPrice":{"type":"BigNumber","hex":"0x59682f0c"},"maxPriorityFeePerGas":{"type":"BigNumber","hex":"0x59682f00"},"maxFeePerGas":{"type":"BigNumber","hex":"0x59682f0c"},"gasLimit":{"type":"BigNumber","hex":"0x030c1e"},"to":"0x73EAaB444Ef8917d17cAe22ed71d678145873A0C","value":{"type":"BigNumber","hex":"0x00"},"nonce":7,"data":"0xb47ad64b000000000000000000000000dc847402dd44ea22828531d163dca7e40d45c68e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000737b2269223a2268747470733a2f2f7777772e6175746f6c69742e65752f393030332d746869636b626f785f64656661756c742f313939372d626d772d6d332d70726f7370656b742d646575747363682e6a7067222c226e223a22424d57204d33222c2264223a22424d57204d3320453336227d00000000000000000000000000","r":"0x1124b036b25ad426ac4f384689f8b96c6e1ecdcf87a7aa6753d35981152013ff","s":"0x3993e48d3f767882600a32593fda94db324f3e037d44176192122ac9fc22f147","v":0,"creates":null,"chainId":0}
    }
);

export const connect = createAsyncThunk('wallet/connect',
    async (arg: void, thunkApi) => {
        await accountProvider.send("eth_requestAccounts", []);
        const signer = accountProvider.getSigner();
        const addr = await signer.getAddress();

        // dispatch updating the tokens for that addr:
        thunkApi.dispatch(loadContractsDetails(addr)); // will load tokens for addr then
        return addr;
    }
);

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        updateBlockChainData: (state, action: PayloadAction<{ blockNumber?: number, networkName?: string, networkChainId?: number, netWorkEnsAddress?: string }>) => {
            console.log(`updateBlockChainData ${JSON.stringify(action.payload)}`);
            state.blockChainData = {
                ...state.blockChainData,
                blockNumber: action.payload.blockNumber || state.blockChainData.blockNumber,
                networkName: action.payload.networkName || state.blockChainData.networkName,
                networkChainId: action.payload.networkChainId || state.blockChainData.networkChainId,
                networkEnsAddress: action.payload.netWorkEnsAddress || state.blockChainData.networkEnsAddress
            };
            console.log(`updatedBlockChainData ${JSON.stringify(state.blockChainData)}`);
        },
        disconnect: (state) => {
            contractProvider.removeAllListeners();
            state.isConnected = false;
            state.address = '';
            state.tokens = {};
        },
        addTempTokenData: (state, action: PayloadAction<{ tokenId: string, parentId?: string }>) => {
            if (!state.tokensData[action.payload.tokenId]) {
                state.tokensData[action.payload.tokenId] = {
                    id: action.payload.tokenId,
                    uri: '',
                    parentId: action.payload.parentId,
                }
            }
        },
        editTokenData: (state, action: PayloadAction<{ tokenId: string, attestationData?: { method?: string }, data?: { name?: string, image?: string, description?: string } }>) => {
            console.log(`editTokenData tokenId=${action.payload.tokenId} data=${JSON.stringify(action.payload.data)} attestationData=${JSON.stringify(action.payload.attestationData)}`);

            if (state.tokensData[action.payload.tokenId]) {
                if (action.payload.data) {
                    if (!state.tokensData[action.payload.tokenId].data) {
                        state.tokensData[action.payload.tokenId].data = action.payload.data;
                    } else {
                        state.tokensData[action.payload.tokenId].data = {
                            ...state.tokensData[action.payload.tokenId].data,
                            ...action.payload.data,
                        }
                    }
                }
                if (action.payload.attestationData) {
                    state.tokensData[action.payload.tokenId].attestationData = {
                        ...state.tokensData[action.payload.tokenId].attestationData,
                        ...action.payload.attestationData,
                    } as AttestationData;
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(connect.fulfilled, (state, action) => {
            console.log(`connect fulfilled! addr=${action.payload}`);
            state.isConnected = true;
            state.address = action.payload;
        }).addCase(connect.pending, (state, action) => {
            console.log(`connect pending...`);
        }).addCase(connect.rejected, (state, action) => {
            console.log(`connect rejected!`);
        }).addCase(loadTokensFor.fulfilled, (state, action) => {
            console.log(`loadTokensFor.fulfilled=${action.payload}`);
            state.tokens = action.payload as TokenMap;
        }).addCase(loadContractsDetails.fulfilled, (state, action) => {
            let contractData = action.payload || {};
            console.log(`loadContractsDetails.fulfilled #contracts=${Object.keys(contractData).length}`);
            if (Object.keys(contractData).length > 0) {
                state.contractsData = action.payload as ContractDataMap;
            }
        }).addCase(loadTokenDataFor.fulfilled, (state, action) => {
            const data = action.payload;
            console.log(`loadTokenDataFor.fulfilled ${data?.id}`);
            if (data) {
                state.tokensData[data.id] = data;
            }
        }).addCase(mintNewToken.fulfilled, (state, action) => {
            console.log(`mintNewToken.fulfilled`, action);
            state.pendingRequests -= 1;
        }).addCase(mintNewToken.pending, (state, action) => {
            console.log(`mintNewToken.pending`, action);
            state.pendingRequests += 1;
        }).addCase(mintNewToken.rejected, (state, action) => {
            console.warn(`mintNewToken.rejected`, action);
            state.pendingRequests -= 1;
        })
    }
})

export const { disconnect, addTempTokenData, editTokenData } = walletSlice.actions
export default walletSlice.reducer
