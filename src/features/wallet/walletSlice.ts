import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface WalletState {
    isConnected: boolean,
    address: number
}

const initialState: WalletState = {
    isConnected: false,
    address: 0
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        connect: (state, action: PayloadAction<number>) => {
            state.isConnected = true;
            state.address = action.payload;
        },
        disconnect: (state) => {
            state.isConnected = false;
            state.address = 0;
        }
    }
})

export const { connect, disconnect } = walletSlice.actions
export default walletSlice.reducer
