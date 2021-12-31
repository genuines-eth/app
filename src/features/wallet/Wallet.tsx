import React from 'react'
import Grid from '@mui/material/Grid'

import { useLocation } from 'react-router-dom'
import { RootState } from '../../app/store'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { connect, disconnect } from './walletSlice'
import TokenCard from '../token/TokenCard'
import AddTokenCard from '../token/AddTokenCard'

export function Wallet(props: { parentTokenId?: string }) {
    const isConnected = useAppSelector((state: RootState) => state.wallet.isConnected)
    const walletAddr = useAppSelector((state: RootState) => state.wallet.address)
    const tokens = useAppSelector((state: RootState) => state.wallet.tokens)
    const contractsData = useAppSelector((state: RootState) => state.wallet.contractsData)
    const tokensData = useAppSelector((state: RootState) => state.wallet.tokensData)
    const location = useLocation();

    const dispatch = useAppDispatch()

    //console.log(`tokens.length=${tokens && Object.keys(tokens).length}`);

    if (!contractsData || !tokens || Object.keys(tokens).length === 0) return (<div></div>);

    //let contractToUse = Object.keys(tokens)[0];
    let contractToUse = contractsData[Object.keys(tokens)[0]];
    if (contractToUse && props.parentTokenId && contractsData) {
        const parentTokenAddr = props.parentTokenId.split('-')[0];
        // which contract has the parentTokenId as parent?
        Object.values(contractsData).forEach((contract) => {
            if (contract.parentAddress === parentTokenAddr) {
                //console.log(`found parent contract!`, contract);
                contractToUse = contract;
            } else {
                //console.log(`not matching parent contract!`, contract);
            }
        });
    }
    // console.log(`contractToUse=${contractToUse?.contractName}`);

    const contractIsParent = Object.values(contractsData).filter((v) => v.parentAddress === contractToUse?.address).length > 0;

    const tokenItems = contractToUse && tokens && Object.keys(tokens).length > 0 && tokens[contractToUse.address].filter((tokenId) => {
        if (props.parentTokenId && tokensData && (tokenId in tokensData)) {
            if (tokensData[tokenId].parentId === props.parentTokenId) return true;
            return false;
        }
        return true;
    }).map((tokenId) => {
        return (
            <Grid item key={tokenId}><TokenCard key={tokenId} tokenId={tokenId} to={contractIsParent ? location.pathname + '/' + tokenId : undefined} /></Grid>
        )
    }
    );

    return (
        <div>
            <Grid container spacing={2} direction='row'>
                {contractToUse && <Grid item key='AddTokenCard1'><AddTokenCard contract={contractToUse} parentId={props.parentTokenId || ''} /></Grid>}
                {tokenItems}
            </Grid>
            <div>
                isConnected={isConnected ? 'true' : 'false'} walletAddr={walletAddr}
            </div>
            <div>
                {false && !isConnected && <button onClick={() => dispatch(connect())}>
                    Connect
                </button>}
                {false && isConnected && <button onClick={() => dispatch(disconnect())}>
                    Disconnect
                </button>}
            </div>
        </div>
    )
}