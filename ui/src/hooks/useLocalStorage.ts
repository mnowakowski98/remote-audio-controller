import { useEffect, useState } from 'react'

export default function useLocalStorage<StorageType>(key: string) {
    const [storageValue, setStorageValue] = useState<StorageType | null>(null)

    useEffect(() => {
        const storageItem = localStorage.getItem(key)
        setStorageValue(storageItem == null ? storageItem : JSON.parse(storageItem))
    }, [key])

    return {
        value: storageValue,
        setValue: (value: StorageType | null) => {
            if (value == null) localStorage.removeItem(key)
            else localStorage.setItem(key, JSON.stringify(value))
            setStorageValue(value)
        }
    }
}