import React from 'react'
import { Navigate } from 'react-router-dom'
import { RootState } from '../../app/store'
import { useAppSelector } from '../../app/hooks'

function RequireAuth({ children, redirectTo }: any) {
    const isConnected = useAppSelector((state: RootState) => state.wallet.isConnected)
    return isConnected ? children : <Navigate to={redirectTo} />;
}

export default RequireAuth;