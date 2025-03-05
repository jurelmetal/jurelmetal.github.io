import { useCallback, useMemo, useRef, useState } from "react";

export type StopwatchState = 'idle' | 'running';

export type Stopwatch = {
    start: () => void;
    stop: () => void;
    reset: () => void;
    state: StopwatchState;
    secs: number;
};

export const useStopwatch = (): Stopwatch => {
    const [state, setState] = useState<StopwatchState>('idle');
    const [secs, setSecs] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const tick = useCallback(() => {
        setSecs(ss => ss + 1);
    }, []);

    const start = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(tick, 1000);
        setState('running');
    }, []);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setState('idle');
    }, []);

    const reset = useCallback(() => {
        setSecs(0);
    }, []);

    return useMemo(() => ({
        start,
        stop,
        reset,
        secs,
        state,
    }), [start, stop, reset, state, secs]);
};