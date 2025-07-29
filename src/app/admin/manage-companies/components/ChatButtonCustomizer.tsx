//app/admin/manage-companies/components/ChatButtonCustomizer.tsx

'use client';

import { useState } from 'react';

type ChatButtonShape = 'square' | 'rounded' | 'pill';

interface ChatButtonCustomizerProps {
  companyId?: string;
  existingValues?: {
    chat_button_text?: string;
    chat_button_bg_color?: string;
    chat_button_text_color?: string;
    chat_button_shape?: ChatButtonShape;
  };
}

export default function ChatButtonCustomizer({ companyId, existingValues }: ChatButtonCustomizerProps) {

  const [text, setText] = useState(existingValues?.chat_button_text || 'Chat with us');
  const [bgColor, setBgColor] = useState(existingValues?.chat_button_bg_color || '#000000');
  const [textColor, setTextColor] = useState(existingValues?.chat_button_text_color || '#FFFFFF');
  const [shape, setShape] = useState<ChatButtonShape>(existingValues?.chat_button_shape || 'rounded');

  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  const shapeClasses: Record<ChatButtonShape, string> = {
    square: 'rounded-none',
    rounded: 'rounded-md',
    pill: 'rounded-full',
  };

  if (!companyId) {
    return (
      <div className="border p-4 rounded text-sm text-gray-600 bg-gray-50">
        Please save the company first before generating a widget snippet.
      </div>
    );
  }

  const saveConfig = async () => {
    try {
      const res = await fetch('/api/admin/update-chat-button', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          chat_button_text: text,
          chat_button_bg_color: bgColor,
          chat_button_text_color: textColor,
          chat_button_shape: shape,
        }),
      });

      if (res.ok) {
        setMessage('Saved successfully.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Save failed.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message);
      setMessage('Error saving config.');
    }
  };

  const handleCopy = () => {
    const snippet = `<script src="https://jobs.ondework.com/widget.js" data-company-id="${companyId}"></script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="space-y-6 border p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold">Chat Button Customization</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          Button Text
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="flex flex-col">
          Background Color
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="mt-1 w-20 h-10 border rounded"
          />
        </label>

        <label className="flex flex-col">
          Text Color
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="mt-1 w-20 h-10 border rounded"
          />
        </label>

        <label className="flex flex-col">
          Shape
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as ChatButtonShape)}
            className="border rounded px-3 py-2 mt-1"
          >
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="pill">Pill</option>
          </select>
        </label>
      </div>

      <div className="pt-4">
        <p className="mb-2 font-medium">Live Preview:</p>
        <button
          style={{ backgroundColor: bgColor, color: textColor }}
          className={`px-5 py-2 ${shapeClasses[shape]} border`}
        >
          {text}
        </button>
      </div>

      <div className="pt-4">
        <p className="mb-2 font-medium">Embed Snippet:</p>
        <div className="bg-gray-100 rounded p-3 text-sm font-mono break-all">{`<script src="https://jobs.ondework.com/widget.js" data-company-id="${companyId}"></script>`}</div>
        <button
          onClick={handleCopy}
          className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {copied ? 'Copied!' : 'Copy Snippet'}
        </button>
      </div>

      <div className="pt-4 flex items-center gap-2">
        <button
          onClick={saveConfig}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Settings
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </div>
  );
}