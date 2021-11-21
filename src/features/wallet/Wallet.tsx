import React from 'react'
import { RootState } from '../../app/store'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { connect, disconnect } from './walletSlice'

export function Wallet() {
    const isConnected = useAppSelector((state: RootState) => state.wallet.isConnected)
    const walletAddr = useAppSelector((state: RootState) => state.wallet.address)
    const dispatch = useAppDispatch()

    return (
        <div>
            <div>
                isConnected={isConnected ? 'true' : 'false'} walletAddr={walletAddr}
            </div>
            <div>
                {!isConnected && <button onClick={() => dispatch(connect(42))}>
                    Connect
                </button>}
                {isConnected && <button onClick={() => dispatch(disconnect())}>
                    Disconnect
                </button>}
            </div>
        </div>
    )
}