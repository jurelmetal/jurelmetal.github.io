import { makeRange } from "./makeRange"

export const repeat = <T> (value: T, times: number): T[] => {
    return makeRange(times).map(() => structuredClone(value));    
};