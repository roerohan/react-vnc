import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import RFB from '../noVNC/core/rfb';

export interface Props {
    url: string;
    style?: object;
    className?: string;
    viewOnly?: boolean;
    focusOnClick?: boolean;
    clipViewport?: boolean;
    dragViewport?: boolean;
    scaleViewport?: boolean;
    resizeSession?: boolean;
    showDotCursor?: boolean;
    background?: string;
    qualityLevel?: number;
    compressionLevel?: number;
    retryDuration?: number;
    debug?: boolean;
}

export type VncScreenHandle = {
    connect: () => void;
    disconnect: () => void;
    connected: boolean;
};

const VncScreen: React.ForwardRefRenderFunction<VncScreenHandle, Props> = (props, ref) => {
    const [rfb, setRfb] = useState<RFB | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const screen = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const {
        url,
        style,
        className,
        viewOnly,
        focusOnClick,
        clipViewport,
        dragViewport,
        scaleViewport,
        resizeSession,
        showDotCursor,
        background,
        qualityLevel,
        compressionLevel,
        retryDuration = 3000,
        debug = false,
    } = props;

    const logger = {
        log: (...args: any[]) => { if (debug) console.log(...args); },
        info: (...args: any[]) => { if (debug) console.info(...args); },
        error: (...args: any[]) => { if (debug) console.error(...args); },
    };

    const disconnect = () => {
        if (!rfb) {
            return;
        }

        rfb.disconnect();
        setRfb(null);
        setConnected(false);
    };

    const connect = () => {
        try {
            disconnect();

            if (!screen.current) {
                return;
            }

            screen.current.innerHTML = '';

            const _rfb = new RFB(screen.current, url);

            _rfb.viewOnly = viewOnly ?? false;
            _rfb.focusOnClick = focusOnClick ?? false;
            _rfb.clipViewport = clipViewport ?? false;
            _rfb.dragViewport = dragViewport ?? false;
            _rfb.resizeSession = resizeSession ?? false;
            _rfb.scaleViewport = scaleViewport ?? false;
            _rfb.showDotCursor = showDotCursor ?? false;
            _rfb.background = background ?? '';
            _rfb.qualityLevel = qualityLevel ?? 6;
            _rfb.compressionLevel = compressionLevel ?? 2;
            setRfb(_rfb);

            _rfb.addEventListener('connect', () => {
                logger.info('Connected to remote VNC.');
                setLoading(false);
            });

            _rfb.addEventListener('disconnect', () => {
                if (connected) {
                    logger.info(`Unexpectedly disconnected from remote VNC, retrying in ${retryDuration / 1000} seconds.`);
                    setTimeout(connect, retryDuration);
                }
                logger.info(`Disconnected from remote VNC.`);
                setLoading(true);
            });

            _rfb.addEventListener('credentialsrequired', () => {
                const password = prompt("Password Required:");
                _rfb.sendCredentials({ password: password });
            });

            _rfb.addEventListener('desktopname', (e: { detail: { name: string } }) => {
                logger.info(`Desktop name is ${e.detail.name}`);
            });

            setConnected(true);
        } catch (err) {
            logger.error(err);
        }
    };

    useImperativeHandle(ref, () => ({
        connect,
        disconnect,
        connected,
    }));

    useEffect(() => {
        connect();

        return disconnect;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = () => {
        if (!rfb) return;

        rfb.focus();
    }

    const handleMouseEnter = () => {
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        handleClick();
    };

    const handleMouseLeave = () => {
        if (!rfb) {
            return;
        }

        rfb.blur();
    };

    return (
        <>
            <div
                style={style}
                className={className}
                ref={screen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            {loading && <div className="text-white loading">Loading...</div>}
        </>
    );
}

export default forwardRef(VncScreen);
