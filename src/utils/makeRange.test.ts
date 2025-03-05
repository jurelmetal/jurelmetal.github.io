import { makeRange } from "./makeRange";

describe('makeRange', () => {
    it('works for 1 parameter', () => {
        expect(makeRange(0)).toStrictEqual([]);
        expect(makeRange(1)).toStrictEqual([0]);
        expect(makeRange(2)).toStrictEqual([0, 1]);
    });
    it('works for 2 parameters', () => {
        expect(makeRange(0, 1)).toStrictEqual([0]);
        expect(makeRange(0, 0)).toStrictEqual([]);
    });
    it('works for 2 parameters with end inclusive', () => {
        expect(makeRange(0, 1, true)).toStrictEqual([0, 1]);
        expect(makeRange(0, 0, true)).toStrictEqual([0]);
    });
    it('works for negative numbers', () => {
        expect(makeRange(-1, 1)).toStrictEqual([-1, 0]);
        expect(makeRange(-3, -2)).toStrictEqual([-3]);
    });
    it('works for negative numbers with end inclusive', () => {
        expect(makeRange(-1, 1, true)).toStrictEqual([-1, 0, 1]);
        expect(makeRange(-3, -2, true)).toStrictEqual([-3, -2]);
        expect(makeRange(-4, 4, true)).toStrictEqual([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
    });
});