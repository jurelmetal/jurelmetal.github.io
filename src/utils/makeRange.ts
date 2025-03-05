export const makeRange = (start: number, end?: number, endInclusive: boolean = false): number[] => {    
    if (end !== undefined) {
        if (start > end) throw Error("start must be less than end");
        const add = endInclusive ? 1 : 0;
        const tmpAdd = Math.max(Math.abs(start), Math.abs(end));
        const [tmpStart, tmpEnd] = [start + tmpAdd, end + tmpAdd];
        const array = [...Array(tmpEnd + add).keys()].slice(tmpStart);
        return array.map((elem) => elem - tmpAdd);
    } else {
        if (start < 0) throw Error("target cannot be negative");
        // start is actually end
        return [...Array(start).keys()];
    }    
};