import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

type Role = 'user' | 'assistant' | 'system';

interface Message {
    role: Role;
    content: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash-latest';

const ChatAgent = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hi! Ask me anything about your simulations or the app.',
        },
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const question = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: question }]);

        if (!GEMINI_API_KEY) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Gemini API key missing. Set VITE_GEMINI_API_KEY in your .env.',
                },
            ]);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: question }] }],
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`Gemini request failed (${response.status})`);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer received.';
            setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
        } catch (err: any) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: err?.message || 'Sorry, something went wrong calling Gemini.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                className="chat-agent-toggle"
                onClick={() => setOpen((v) => !v)}
                aria-label="Open AI assistant"
            >
                {open ? <X size={20} /> : <MessageSquare size={24} />}
            </button>

            {open && (
                <div className="chat-agent-panel">
                    <div className="chat-agent-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18} />
                            <span>AI Assistant</span>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    <div className="chat-agent-messages" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`chat-agent-message ${msg.role === 'user' ? 'user' : ''}`}
                            >
                                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
                                    {msg.role === 'user' ? 'You' : 'Assistant'}
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-agent-message">
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-agent-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={loading}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                        >
                            <Send size={16} />
                            <span style={{ marginLeft: 6 }}>Send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatAgent;

