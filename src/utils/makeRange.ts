export const makeRange = (start: number, end?: number, endInclusive: boolean = false): number[] => {
    if (end) {
        if (endInclusive) {
            return [...Array(end + 1).keys()].filter((elem) => elem >= start);
        } else {
            return [...Array(end).keys()].filter((elem) => elem >= start);
        }
    } else {
        // start is actually end
        return [...Array(start).keys()];
    }    
};