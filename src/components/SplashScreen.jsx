import { useState } from 'react';
import logo from '@/images/logo.png';

export default function SplashScreen({ onFinish }) {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    const handleStart = () => {
        setFadeOut(true);
        setTimeout(() => {
            setVisible(false);
            if (onFinish) onFinish();
        }, 500);
    };

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fbf8f4',
                transition: 'opacity 0.5s ease',
                opacity: fadeOut ? 0 : 1,
                pointerEvents: fadeOut ? 'none' : 'all',
            }}
        >
            {/* Logo + App name */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    animation: 'splashPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                    flex: 1,
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: '200px',
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={logo}
                        alt="WongKhao Logo"
                        style={{
                            width: '180px',
                            height: '180px',
                            objectFit: 'contain',
                        }}
                    />
                </div>
                <span
                    style={{
                        color: '#1B4332',
                        fontSize: '28px',
                        fontWeight: '700',
                        fontFamily: "'TH-Chara', sans-serif",
                        letterSpacing: '0.5px',
                    }}
                >
                    วงข้าว
                </span>
            </div>

            {/* Start button at bottom */}
            <div
                style={{
                    paddingBottom: '52px',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    animation: 'splashSlideUp 0.7s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
            >
                <button
                    onClick={handleStart}
                    style={{
                        backgroundColor: '#2D6A4F',
                        color: '#ffffff',
                        fontSize: '17px',
                        fontWeight: '600',
                        fontFamily: "'TH-Chara', sans-serif",
                        padding: '16px 0',
                        width: '80%',
                        maxWidth: '360px',
                        borderRadius: '16px',
                        border: 'none',
                        cursor: 'pointer',
                        letterSpacing: '0.3px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        transition: 'transform 0.15s ease, background-color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1B4332'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2D6A4F'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    เริ่มใช้งาน
                </button>
            </div>

            <style>{`
                @keyframes splashPopIn {
                    from { opacity: 0; transform: scale(0.75); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes splashSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
