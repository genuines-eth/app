import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import { Link } from 'react-router-dom';
import { RootState } from './store'
import { useAppDispatch, useAppSelector } from './hooks'
import { connect, disconnect } from '../features/wallet/walletSlice'
import { LinearProgress, Stack } from '@mui/material';


export default function ButtonAppBar() {
    const isConnected = useAppSelector((state: RootState) => state.wallet.isConnected)
    const blockChainData = useAppSelector((state: RootState) => state.wallet.blockChainData)
    const dispatch = useAppDispatch()
    const [lastBlockTimes, setLastBlockTimes] = React.useState<number[]>([]);
    const [lastBlock, setLastBlock] = React.useState(0);
    const [avgBlockDur, setAvgBlockDur] = React.useState<number>(0);
    const [blockProgress, setBlockProgress] = React.useState<number | undefined>(undefined);

    //console.log(`ButtonAppBar blockChainData=${JSON.stringify(blockChainData)}`);

    React.useEffect(() => {
        if (blockChainData.blockNumber !== lastBlock) {
            if (lastBlock !== 0) {
                let now = Date.now()
                setLastBlockTimes(prev => {
                    let arr = [];
                    arr.push(...prev.slice(prev.length < 5 ? 0 : 1), now);
                    return arr;
                });
            }
            setLastBlock(blockChainData.blockNumber);
        }
    }, [blockChainData, lastBlock]);

    React.useEffect(() => {
        // calc avg. lastBlockTimes:
        if (lastBlockTimes.length > 2) {
            let avg = 0;
            let avgCnt = 0;
            for (let i = 2; i < lastBlockTimes.length; i++) {
                let dist = lastBlockTimes[i] - lastBlockTimes[i - 1];
                avg += dist;
                avgCnt += 1;
            }
            avg /= avgCnt;
            if (Math.abs(avg - avgBlockDur) > 1000) {
                setAvgBlockDur(avg);
                setBlockProgress(0);
            }
            //console.log(`avg blocktime = ${avg}ms`);
        }

    }, [lastBlockTimes, avgBlockDur]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            // update block progress
            if (avgBlockDur > 0 && lastBlockTimes.length > 2) {
                const now = Date.now();
                const dur = now - lastBlockTimes[lastBlockTimes.length - 1];
                const newBlockProgress = 100 * (dur / avgBlockDur);
                //console.log(`newBlockProgress=${newBlockProgress} dur=${dur} avg=${avgBlockDur} len=${lastBlockTimes.length}`);
                if (newBlockProgress > 200) { setBlockProgress(undefined); } else { setBlockProgress(newBlockProgress); }
            }
        }, 500);
        return () => {
            clearInterval(interval);
        }
    }, [avgBlockDur, lastBlockTimes]);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar enableColorOnDark style={{ 'backgroundColor': '#cdd0d7' }}> { /* todo why is the color needed? */}
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Link to="/" style={{ textDecoration: 'inherit', color: 'inherit' }}><Typography variant="h6" component="div"
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                        genuine's
                    </Typography></Link>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ mr: 2 }}>
                        <Stack spacing={0}>
                            <Typography variant="caption" component="div" color="text.secondary">{`Last block ${lastBlock !== 0 ? lastBlock : 'none'}`}</Typography>
                            {blockProgress === undefined && <LinearProgress color='secondary' />}
                            {blockProgress !== undefined && <LinearProgress variant="determinate" color='success' value={blockProgress} />}
                        </Stack>
                    </Box>
                    <Box sx={{ mr: 1 }}></Box>
                    {!isConnected && <Button color="inherit" onClick={() => dispatch(connect())}>Connect</Button>}
                    {isConnected && <Button color="inherit" onClick={() => dispatch(disconnect())}>Disconnect</Button>}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
