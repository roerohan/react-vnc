import React, { useEffect, useRef, useState } from 'react';
import RFB from '../noVNC/core/rfb';

interface Props {
    url: string;
    style?: object;
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
}

export default function VncScreen(props: Props) {
    const [rfb, setRfb] = useState<RFB | null>(null);
    const screen = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const {
        url,
        style,
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
    } = props;

    const disconnect = () => {
        if (!rfb) {
            return;
        }

        rfb.disconnect();
        setRfb(null);
    };

    const connect = () => {
        disconnect();

        if (!screen.current) {
            return;
        }

        screen.current.innerHTML = '';

        const _rfb = new RFB(screen.current, url);

        _rfb.viewOnly = viewOnly || false;
        _rfb.focusOnClick = focusOnClick || false;
        _rfb.clipViewport = clipViewport || false;
        _rfb.dragViewport = dragViewport || false;
        _rfb.resizeSession = resizeSession || false;
        _rfb.scaleViewport = scaleViewport || false;
        _rfb.showDotCursor = showDotCursor || false;
        _rfb.background = background || '';
        _rfb.qualityLevel = qualityLevel || 6;
        _rfb.compressionLevel = compressionLevel || 2;
        setRfb(_rfb);

        _rfb.addEventListener('connect', () => {
            console.log('Connected to remote browser.');
            setLoading(false);
        });

        _rfb.addEventListener('disconnect', () => {
            console.log('Disconnected from remote browser.');
            setTimeout(connect, 3000);
            setLoading(true);
        });

        _rfb.addEventListener('credentialsrequired', () => {
            const password = prompt("Password Required:");
            _rfb.sendCredentials({ password: password });
        });

        _rfb.addEventListener('desktopname', (e: { detail: { name: string } }) => {
            console.log(`Desktop name is ${e.detail.name}`);
        });
    };

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
                ref={screen}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            {loading && <div className="text-white loading">Loading...</div>}
        </>
    );
}
