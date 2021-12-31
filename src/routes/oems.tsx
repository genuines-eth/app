import { Wallet } from "../features/wallet/Wallet";

import { RootState } from '../app/store'
import { useAppSelector } from '../app/hooks'

import { Link, useLocation } from 'react-router-dom'

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';

import TokenCard from '../features/token/TokenCard'

function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    console.info('You clicked a breadcrumb.');
}

function SelectionBreadcrumbs(props: { paths: string[] }) {
    const tokensData = useAppSelector((state: RootState) => state.wallet.tokensData);

    if (props.paths.length < 1) {
        // choose brand tokens first:
        return (
            <Typography >Choose a brand token (or create a brand):</Typography>
        );
    }

    return (
        <div role="presentation" onClick={handleClick}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link to="/oems">
                    <Typography
                        sx={{ display: 'flex', alignItems: 'center' }}
                        color="text.primary"
                    >

                        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Brand selection
                    </Typography>
                </Link>
                {props.paths.map((path, index, paths) => {
                    return (
                        <Link key={`${paths}_${path}_${index}`} to={'/oems/' + paths.slice(0, index + 1).join('/')}>
                            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }} >
                                {tokensData && tokensData[path]?.data?.image && <Box component="img" src={tokensData[path]?.data?.image} sx={{ maxHeight: { xs: 30 } }}></Box>}
                                {(tokensData && tokensData[path]?.data?.name) || path}
                            </Typography>
                        </Link>
                    )
                })}
            </Breadcrumbs>
        </div>
    );
}

export default function OEMs() {

    const location = useLocation();
    //console.log(location.pathname); // todo remove any trailing '/' or splice away
    const paths = location.pathname.split('/').slice(2); // w.o. /oems/
    //console.log(paths);
    // each path consists of contractAddr-tokenId
    const parentToken = paths.length > 0 ? paths[paths.length - 1] : undefined;

    return (
        <main style={{
            padding: "1rem 0"
        }}>
            <h2>OEMs</h2>
            <SelectionBreadcrumbs paths={paths} />
            {paths.map((path, index, paths) => {
                return (
                    <TokenCard key={path} tokenId={path} to={"/oems/" + paths.slice(0, index + 1).join('/')} />
                )
            })}
            <Wallet parentTokenId={parentToken} />
        </main>
    );
}