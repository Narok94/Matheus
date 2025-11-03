import { useEffect, useRef } from 'react';

export const useIdleTimer = (onIdle: () => void, idleTime: number) => {
    const timeoutId = useRef<number | null>(null);

    useEffect(() => {
        const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

        const resetTimer = () => {
            if (timeoutId.current) {
                window.clearTimeout(timeoutId.current);
            }
            timeoutId.current = window.setTimeout(onIdle, idleTime);
        };
        
        const eventListener = () => resetTimer();
        
        events.forEach(event => window.addEventListener(event, eventListener, { passive: true }));
        resetTimer(); // Start the timer on mount

        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
            events.forEach(event => window.removeEventListener(event, eventListener));
        };
    }, [onIdle, idleTime]);

    return;
};
