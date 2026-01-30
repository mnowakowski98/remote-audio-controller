import type { Action, Middleware, ThunkAction } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'

import { configReducer } from './slices/configSlice'
import { filePlayerReducer } from './slices/filePlayer'
import { sendSyncData } from './servers/stateSync'

import { selectUIState as selectSoundFilesUIState, soundFilesReducer } from './slices/soundFiles'
import { soundFileKey } from './models/soundFiles'
import { selectUIState as selectFilePlayerUIState } from './slices/filePlayer'
import { filePlayerKey } from './models/filePlayer'

const uiStateSelectors: { typeKey: string, select: (state: RootState) => unknown }[] = [
  { typeKey: filePlayerKey, select: selectFilePlayerUIState },
  { typeKey: soundFileKey, select: selectSoundFilesUIState }
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
        filePlayer: filePlayerReducer,
        soundFiles: soundFilesReducer
    },
    middleware: (gdm) => gdm().concat(dataSync)
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