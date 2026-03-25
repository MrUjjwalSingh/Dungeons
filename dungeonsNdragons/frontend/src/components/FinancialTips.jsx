import { useState, useEffect } from 'react';

const ENQUIRY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6Yza2TDpYL6T85NHXWNJGQLJFDHzaUxXYILlc6teqG2Jafw/viewform';

const TIPS = [
    "Diversify your stats like you diversify your portfolio — brought to you by Money Mantra Investments.",
    "Shield your HP with strong armor, and shield your family with Money Mantra Life Insurance.",
    "Planning for retirement? Start investing with MMI today for a secure future.",
    "A strong party needs a strong portfolio. Invest wisely with Money Mantra Investments.",
    "Your gold won't grow in a chest. Let MMI help you multiply your wealth.",
    "Tip: The best defense against inflation is a well-planned investment. Talk to MMI!",
    "Whether it's Mutual Funds, Life Insurance, or Tax Saving — MMI has your back.",
    "Don't just hoard gold — invest it. Visit Money Mantra Investments today.",
    "Join the MMI Guild for financial wisdom that lasts longer than any quest reward.",
    "Protect your party's future. Money Mantra Investments — Your Path to Wealth Creation.",
];

export default function FinancialTips() {
    const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));

    useEffect(() => {
        const interval = setInterval(() => {
            setIdx(i => (i + 1) % TIPS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(0,200,180,0.06), rgba(255,191,0,0.04))',
            border: '1px solid rgba(0,200,180,0.15)',
            borderRadius: 8,
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: '2rem',
        }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💰</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 10,
                    color: '#00c8b4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 4,
                    fontWeight: 700,
                }}>Financial Tip from MMI</p>
                <p style={{
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: 13,
                    color: '#d4c5ab',
                    lineHeight: 1.5,
                    transition: 'opacity 0.3s',
                }}>{TIPS[idx]}</p>
            </div>
            <a href={ENQUIRY_URL} target="_blank" rel="noopener noreferrer"
                style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#402d00',
                    background: '#ffbf00',
                    padding: '6px 14px',
                    borderRadius: 4,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 12px rgba(255,191,0,0.3)',
                    flexShrink: 0,
                }}>Enquire Now</a>
        </div>
    );
}
