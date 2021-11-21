import { configureStore } from '@reduxjs/toolkit'
import walletReducer from '../features/wallet/walletSlice'

// see https://redux.js.org/usage/usage-with-typescript

export const store = configureStore({
    reducer: {
        wallet: walletReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
