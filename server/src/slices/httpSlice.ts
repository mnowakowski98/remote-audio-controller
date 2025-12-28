import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const slice = createSlice({
    name: 'http',
    initialState: {
        currentPort: 0
    },
    reducers: {
        setPort: (state, action: PayloadAction<number>) => {
            state.currentPort = action.payload
        }
    }
})

export const httpReducer = slice.reducer
export const { setPort } = slice.actions