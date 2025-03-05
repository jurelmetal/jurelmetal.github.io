
export const toTimer = (seconds: number): string => {
    return new Date(seconds * 1000).toISOString().substring(11, 19);
};