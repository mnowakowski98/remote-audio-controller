import type { Action, Middleware, ThunkAction } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'

import { configReducer } from './slices/configSlice'
import { httpReducer } from './slices/httpSlice'
import { filePlayerReducer } from './slices/filePlayer'
import { sendSyncData } from './servers/stateSync'

import { selectUIState as selectFilePlayerUIState } from './slices/filePlayer'
import { filePlayerKey } from './models/filePlayer'

const uiStateSelectors = [
  { typeKey: filePlayerKey, select: selectFilePlayerUIState }
]

const dataSync: Middleware = ({ getState }) => {
  return next => _action => {
    const action = _action as Action
    const returnVal = next(action)
    const newState = getState() as RootState
    const typeKey = action.type.slice(0, action.type.indexOf('/'))
    const uiState = uiStateSelectors.find((selector) => selector.typeKey == typeKey)?.select(newState)
    if (uiState == undefined) return returnVal
    sendSyncData(typeKey, uiState)
    return returnVal
  }
}

export const store = configureStore({
    reducer: {
        config: configReducer,
        http: httpReducer,
        filePlayer: filePlayerReducer
    },
    middleware: (gdm) => gdm({
      serializableCheck: {
        ignoredActionPaths: ['payload'],
        ignoredPaths: ['filePlayer.playingFile.audio', 'filePlayer.playingFile.speaker']
      }
    }).concat(dataSync)
})

// Infer the type of `store`
export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch']
// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>