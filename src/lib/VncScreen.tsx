import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import RFB, { NoVncEventType, NoVncEvents, NoVncOptions } from '@novnc/novnc/lib/rfb';

type EventListeners = { [T in NoVncEventType]?: (event: NoVncEvents[T]) => void };

export interface Props {
    url: string;
    style?: object;
    className?: string;
    viewOnly?: boolean;
    rfbOptions?: Partial<NoVncOptions>;
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
    onConnect?: EventListeners['connect'];
    onDisconnect?: EventListeners['disconnect'];
    onCredentialsRequired?: EventListeners['credentialsrequired'];
    onSecurityFailure?: EventListeners['securityfailure'];
    onClipboard?: EventListeners['clipboard'];
    onBell?: EventListeners['bell'];
    onDesktopName?: EventListeners['desktopname'];
    onCapabilities?: EventListeners['capabilities'];
}

export type VncScreenHandle = {
    connect: () => void;
    disconnect: () => void;
    connected: boolean;
    sendCredentials: (credentials: NoVncOptions["credentials"]) => void;
    sendKey: (keysym: number, code: string, down?: boolean) => void;
    sendCtrlAltDel: () => void;
    focus: () => void;
    blur: () => void;
    machineShutdown: () => void;
    machineReboot: () => void;
    machineReset: () => void;
    clipboardPaste: (text: string) => void;
    rfb: RFB | null;
    loading: boolean;
    eventListeners: EventListeners;
};

const VncScreen: React.ForwardRefRenderFunction<VncScreenHandle, Props> = (props, ref) => {
    const rfb = useRef<RFB | null>(null);
    const connected = useRef<boolean>(props.autoConnect ?? true);
    const timeouts = useRef<Array<NodeJS.Timeout>>([]);
    const eventListeners = useRef<EventListeners>({});
    const screen = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const {
        url,
        style,
        className,
        viewOnly,
        rfbOptions,
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
        onConnect,
        onDisconnect,
        onCredentialsRequired,
        onSecurityFailure,
        onClipboard,
        onBell,
        onDesktopName,
        onCapabilities,
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

    const _onConnect = (e: NoVncEvents['connect']) => {
        if (onConnect) {
            onConnect(e);
            setLoading(false);
            return;
        }

        logger.info('Connected to remote VNC.');
        setLoading(false);
    };

    const _onDisconnect: EventListeners['disconnect'] = (e) => {
        if (onDisconnect) {
            onDisconnect(e);
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

    const _onCredentialsRequired: EventListeners['credentialsrequired'] = (e) => {
        const rfb = getRfb();
        if (onCredentialsRequired) {
            onCredentialsRequired(e);
            return;
        }

        const username = rfbOptions?.credentials?.username ?? '';
        const password = rfbOptions?.credentials?.password ?? '';
        const target = rfbOptions?.credentials?.target ?? '';
        rfb?.sendCredentials({ password, username, target });
    };

    const _onDesktopName: EventListeners['desktopname'] = (e) => {
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
            (Object.keys(eventListeners.current) as (NoVncEventType)[]).forEach((event) => {
                if (eventListeners.current[event]) {
                    rfb.removeEventListener(event, eventListeners.current[event]!);
                    eventListeners.current[event] = undefined;
                }
            });
            rfb.disconnect();
            setRfb(null);
            setConnected(false);

            // NOTE(roerohan): This needs to be called since the event listener is removed.
            // Even if the event listener is removed after rfb.disconnect(), the disconnect
            // event is not fired.
            _onDisconnect(new CustomEvent('disconnect', { detail: { clean: true } }));
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

            const _rfb = new RFB(screen.current, url, rfbOptions);

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

            eventListeners.current.connect = _onConnect;
            eventListeners.current.disconnect = _onDisconnect;
            eventListeners.current.credentialsrequired = _onCredentialsRequired;
            eventListeners.current.securityfailure = onSecurityFailure;
            eventListeners.current.clipboard = onClipboard;
            eventListeners.current.bell = onBell;
            eventListeners.current.desktopname = _onDesktopName;
            eventListeners.current.capabilities = onCapabilities;

            (Object.keys(eventListeners.current) as (NoVncEventType)[]).forEach((event) => {
                if (eventListeners.current[event]) {
                    _rfb.addEventListener(event, eventListeners.current[event]!);
                }
            });

            setConnected(true);
        } catch (err) {
            logger.error(err);
        }
    };

    const sendCredentials = (credentials: NoVncOptions["credentials"]) => {
        const rfb = getRfb();
        const creds = {
            username: credentials?.username ?? '',
            password: credentials?.password ?? '',
            target: credentials?.target ?? '',
        }
        rfb?.sendCredentials(creds);
    };

    const sendKey = (keysym: number, code: string, down?: boolean) => {
        const rfb = getRfb();
        rfb?.sendKey(keysym, code, down);
    };

    const sendCtrlAltDel = () => {
        const rfb = getRfb();
        rfb?.sendCtrlAltDel();
    };

    const focus = () => {
        const rfb = getRfb();
        rfb?.focus();
    };

    const blur = () => {
        const rfb = getRfb();
        rfb?.blur();
    };

    const machineShutdown = () => {
        const rfb = getRfb();
        rfb?.machineShutdown();
    };

    const machineReboot = () => {
        const rfb = getRfb();
        rfb?.machineReboot();
    };

    const machineReset = () => {
        const rfb = getRfb();
        rfb?.machineReset();
    };

    const clipboardPaste = (text: string) => {
        const rfb = getRfb();
        rfb?.clipboardPasteFrom(text);
    };

    useImperativeHandle(ref, () => ({
        connect,
        disconnect,
        connected: connected.current,
        sendCredentials,
        sendKey,
        sendCtrlAltDel,
        focus,
        blur,
        machineShutdown,
        machineReboot,
        machineReset,
        clipboardPaste,
        rfb: rfb.current,
        loading,
        eventListeners: eventListeners.current,
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
        <div
            style={style}
            className={className}
            ref={screen}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
}

export default forwardRef(VncScreen);
