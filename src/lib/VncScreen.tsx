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
    autoConnect?: boolean;
    retryDuration?: number;
    debug?: boolean;
    loadingUI?: React.ReactNode;
    onConnect?: (rfb?: RFB) => void;
    onDisconnect?: (rfb?: RFB) => void;
    onCredentialsRequired?: (rfb?: RFB) => void;
    onDesktopName?: (e?: { detail: { name: string } }) => void;
}

export type VncScreenHandle = {
    connect: () => void;
    disconnect: () => void;
    connected: boolean;
};

const VncScreen: React.ForwardRefRenderFunction<VncScreenHandle, Props> = (props, ref) => {
    const rfb = useRef<RFB | null>(null);
    const connected = useRef<boolean>(props.autoConnect ?? true);
    const timeouts = useRef<Array<NodeJS.Timeout>>([]);
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
        autoConnect = true,
        retryDuration = 3000,
        debug = false,
        loadingUI,
        onConnect,
        onDisconnect,
        onCredentialsRequired,
        onDesktopName,
    } = props;

    const logger = {
        log: (...args: any[]) => { if (debug) console.log(...args); },
        info: (...args: any[]) => { if (debug) console.info(...args); },
        error: (...args: any[]) => { if (debug) console.error(...args); },
    };

    const getRfb = () => {
        return rfb.current;
    };

    const setRfb = (_rfb: RFB | null) => {
        rfb.current = _rfb;
    };

    const getConnected = () => {
        return connected.current;
    };

    const setConnected = (state: boolean) => {
        connected.current = state;
    };

    const _onConnect = () => {
        const rfb = getRfb();
        if (onConnect) {
            onConnect(rfb ?? undefined);
            setLoading(false);
            return;
        }

        logger.info('Connected to remote VNC.');
        setLoading(false);
    };

    const _onDisconnect = () => {
        const rfb = getRfb();
        if (onDisconnect) {
            onDisconnect(rfb ?? undefined);
            setLoading(true);
            return;
        }

        const connected = getConnected();
        if (connected) {
            logger.info(`Unexpectedly disconnected from remote VNC, retrying in ${retryDuration / 1000} seconds.`);

            timeouts.current.push(setTimeout(connect, retryDuration));
        } else {
            logger.info(`Disconnected from remote VNC.`);
        }
        setLoading(true);
    };

    const _onCredentialsRequired = () => {
        const rfb = getRfb();
        if (onCredentialsRequired) {
            onCredentialsRequired(rfb ?? undefined);
            return;
        }

        const password = prompt("Password Required:");
        rfb?.sendCredentials({ password: password });
    };

    const _onDesktopName = (e: { detail: { name: string } }) => {
        if (onDesktopName) {
            onDesktopName(e);
            return;
        }

        logger.info(`Desktop name is ${e.detail.name}`);
    };

    const disconnect = () => {
        const rfb = getRfb();
        try {
            if (!rfb) {
                return;
            }

            timeouts.current.forEach(clearTimeout);
            rfb.removeEventListener('connected', _onConnect);
            rfb.removeEventListener('disconnect', _onDisconnect);
            rfb.removeEventListener('credentialsrequired', _onCredentialsRequired);
            rfb.removeEventListener('desktopname', _onDesktopName);
            rfb.disconnect();
            setRfb(null);
            setConnected(false);

            // NOTE(roerohan): This needs to be called since the event listener is removed.
            // Even if the event listener is removed after rfb.disconnect(), the disconnect
            // event is not fired.
            _onDisconnect();
        } catch (err) {
            logger.error(err);
            setRfb(null);
            setConnected(false);
        }
    };

    const connect = () => {
        try {
            if (connected && !!rfb) {
                disconnect();
            }

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

            _rfb.addEventListener('connect', _onConnect);

            _rfb.addEventListener('disconnect', _onDisconnect);

            _rfb.addEventListener('credentialsrequired', _onCredentialsRequired);

            _rfb.addEventListener('desktopname', _onDesktopName);

            setConnected(true);
        } catch (err) {
            logger.error(err);
        }
    };

    useImperativeHandle(ref, () => ({
        connect,
        disconnect,
        connected: connected.current,
    }));

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return disconnect;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = () => {
        const rfb = getRfb();
        if (!rfb) return;

        rfb.focus();
    };

    const handleMouseEnter = () => {
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        handleClick();
    };

    const handleMouseLeave = () => {
        const rfb = getRfb();
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
            {loading && (loadingUI ?? <div className="text-white loading">Loading...</div>)}
        </>
    );
}

export default forwardRef(VncScreen);
