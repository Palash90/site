import React, { useState, useEffect } from "react";
import GuitaleleViewer from "./GuitaleleViewer";
import { parseShorthandText } from "./parseShorthandUtils";
import ShareButtons from "../ShareButtons";
import { FaInfoCircle } from "react-icons/fa";

export default function TabViewer(props) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Clear old states when moving across different tabs/blogs
        setLoading(true);
        setError(null);

        fetch(props.tab)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(textData => {
                const { scores, errors } = parseShorthandText(textData);
                if (errors.length > 0) {
                    console.warn("Score validation errors:", errors);
                }
                setData(scores[0]);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, [props.tab]);

    if (loading) return <p className="text-slate-400 p-6 font-mono text-xs">Loading context elements...</p>;
    if (error) return <p className="text-rose-500 p-6 font-mono text-xs">Error loading score structure: {error.message}</p>;
    console.log(data)

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = data?.title ? `Check out this score: ${data.title}` : 'Check out this score';

    const shareLinks = [
        {
            name: 'Facebook',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: '#1877F2',
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            )
        },
        {
            name: 'X',
            url: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            color: '#000000',
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        },
        {
            name: 'Reddit',
            url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
            color: '#FF4500',
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.51 8.16c.79 0 1.43.64 1.43 1.43 0 .63-.41 1.17-.97 1.36.03.17.05.35.05.53 0 2.73-3.24 4.95-7.23 4.95S3.92 14.21 3.92 11.48c0-.18.02-.36.05-.53-.56-.19-.97-.73-.97-1.36 0-.79.64-1.43 1.43-1.43.38 0 .72.14.99.38a6.26 6.26 0 0 1 3.34-1.06l.63-2.98a.32.32 0 0 1 .38-.26l2.11.44a1.02 1.02 0 0 1 .92-.54c.56 0 1.01.45 1.01 1.01 0 .55-.45 1-1.01 1-.44 0-.82-.28-.95-.68l-1.88-.39-.56 2.65a6.3 6.3 0 0 1 3.27 1.05c.26-.23.6-.37.98-.37zM8.4 12.13c.53 0 .96.43.96.96a.96.96 0 0 1-.96.96.96.96 0 0 1-.96-.96.96.96 0 0 1 .96-.96zm4.67 3.81a3.44 3.44 0 0 1-2.14.69 3.44 3.44 0 0 1-2.14-.69.3.3 0 0 1 .41-.44c.46.39 1.08.62 1.73.62s1.27-.23 1.73-.62a.3.3 0 0 1 .41.44zm-.54-2.85c.53 0 .96.43.96.96a.96.96 0 0 1-.96.96.96.96 0 0 1-.96-.96.96.96 0 0 1 .96-.96z" />
                </svg>
            )
        },
        {
            name: 'WhatsApp',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
            color: '#25D366',
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            )
        },
        {
            name: 'Telegram',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            color: '#0088cc',
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
            )
        }
    ];

    return props.tab && data ? (
        <div className="bg-slate-950 min-h-screen text-slate-100 p-6 flex flex-col gap-4">
            <div className="mt-2">
                <h3 className="text-lg font-bold tracking-tight text-slate-300 mb-2">
                    Score Viewer - {data.title}
                    <a href="/content/guitalele-tab-quick-view" target="_blank" rel="noopener noreferrer" className="ms-2 text-decoration-none" style={{ opacity: 0.4, verticalAlign: "middle" }} title="Tab reading guide">
                        <FaInfoCircle size={14} />
                    </a>
                </h3>
                <GuitaleleViewer scoreData={data} editorMode={false} />
            </div>
        </div>
    ) : <></>;
}
