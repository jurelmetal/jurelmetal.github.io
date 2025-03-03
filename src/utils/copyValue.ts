import { makeRange } from "./makeRange"

export const copyValue = <T> (value: T, times: number): T[] => {
    return makeRange(times).map(() => structuredClone(value));    
};