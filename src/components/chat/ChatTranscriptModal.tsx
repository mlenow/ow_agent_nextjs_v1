//app/src/app/admin/manage-companies/components/ChatTranscriptModal.tsx

'use client';

import { useState, useEffect, useRef } from 'react';

type Props = {
  companyId: number;
  companyName: string;
  contactEmail: string;
  onClose?: () => void;
};

type ChatEntry = {
  sender: 'user' | 'agent';
  message: string;
};

export default function ChatTranscriptModal({ companyId, companyName, onClose }: Props) {
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [tokenTotal, setTokenTotal] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const getHistoryForOpenAI = () => {
    return chatLog.map(entry => ({
      role: entry.sender === 'user' ? 'user' : 'assistant',
      content: entry.message,
    }));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setChatLog(prev => [...prev, { sender: 'user', message: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/tools/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          user_input: userMessage,
          chat_history: getHistoryForOpenAI(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.assistant_message) {
        setChatLog(prev => [...prev, { sender: 'agent', message: data.assistant_message }]);
         if (data.token_usage) {
            setTokenTotal(prev => prev + data.token_usage);
        }
      } else {
        setChatLog(prev => [...prev, { sender: 'agent', message: 'Sorry, something went wrong.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatLog(prev => [...prev, { sender: 'agent', message: 'There was an error reaching the assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/admin/tools/save-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: companyId,
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        chat_transcript: chatLog,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert('Failed to save application.');
    }
  };

  useEffect(() => {
    const loadInitialAssistantMessage = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/tools/chat-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            user_input: 'start', // dummy prompt to trigger opening
            chat_history: [],
          }),
        });

        const data = await res.json();
        if (res.ok && data.assistant_message) {
          setChatLog([{ sender: 'agent', message: data.assistant_message }]);
          if (data.token_usage) {
            setTokenTotal(data.token_usage);
          }
        } else {
          setChatLog([{ sender: 'agent', message: 'Welcome! (But we had trouble generating a message)' }]);
        }
      } catch (err) {
        console.error('Chat agent error:', err);
        setChatLog([{ sender: 'agent', message: 'There was an error reaching the assistant.' }]);
      } finally {
        setLoading(false);
      }
    };

    if (chatLog.length === 0) {
      loadInitialAssistantMessage();
    }
  }, [companyId, chatLog.length]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatLog]);

  if (!hasHydrated) return null;

  return (
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-auto h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Apply Now – {companyName}</h2>
          {onClose && (
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-black">✕</button>
          )}
        </div>

        {/* Chat messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto border p-2 space-y-2 text-sm bg-gray-50"
        >
          {chatLog.map((msg, idx) => (
            <div key={idx} className={`p-2 rounded max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-100 self-start'}`}>
              <strong>{msg.sender === 'user' ? 'You' : 'Assistant'}:</strong> {msg.message}
            </div>
          ))}
        </div>

        {/* Input field */}
        {!submitted && (
          <div className="flex mt-2 space-x-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 border p-2 rounded"
              placeholder="Type your message..."
              disabled={loading || showSubmitForm}
            />
            <button
              onClick={handleSend}
              disabled={loading || showSubmitForm}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        )}

        {/* Finish & Submit button */}
        {!submitted && chatLog.length > 1 && !showSubmitForm && (
          <div className="mt-4">
            <button
              onClick={() => setShowSubmitForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Finish & Submit
            </button>
          </div>
        )}

        {/* Applicant details form */}
        {showSubmitForm && !submitted && (
          <div className="mt-4 space-y-2 text-sm">
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              type="email"
              className="w-full border p-2 rounded"
              placeholder="Email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="tel"
              className="w-full border p-2 rounded"
              placeholder="Phone (optional)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-700 text-white px-4 py-2 rounded w-full"
            >
              Confirm Submission
            </button>
          </div>
        )}

        {submitted && (
          <div className="mt-4 text-green-700 font-semibold text-sm text-center">
            ✅ Received!
          </div>
        )}

        {/* Token usage info */}
        {process.env.NODE_ENV === 'development' && tokenTotal > 0 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            ~{tokenTotal} tokens used ≈ ${(tokenTotal * 0.00001).toFixed(4)} USD
          </div>
        )}

      </div>
    
  );
}

