// import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import { RootState } from './store'
import { useAppDispatch, useAppSelector } from './hooks'
import { connect, disconnect } from '../features/wallet/walletSlice'


export default function ButtonAppBar() {
    const isConnected = useAppSelector((state: RootState) => state.wallet.isConnected)
    const dispatch = useAppDispatch()

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar >
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
                    <Typography variant="h6" component="div"
                        //sx={{ flexGrow: 1 }}
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                        genuines
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    {!isConnected && <Button color="inherit" onClick={() => dispatch(connect(42))}>Connect</Button>}
                    {isConnected && <Button color="inherit" onClick={() => dispatch(disconnect())}>Disconnect</Button>}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
