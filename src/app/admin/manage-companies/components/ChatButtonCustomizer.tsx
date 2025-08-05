//app/admin/manage-companies/components/ChatButtonCustomizer.tsx

'use client';

import { useState } from 'react';

type ChatButtonShape = 'square' | 'rounded' | 'pill';
type EmbedMethod = 'standard' | 'enhanced';

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

  const [copiedStandard, setCopiedStandard] = useState(false);
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<EmbedMethod>('standard');
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

  const getStandardSnippet = () => {
    return `<script
    id="ondework-widget-loader"
    async
    defer
    data-company-id="${companyId}"
    src="https://cdn.ondework.com/widget.js">
  </script>`;
  };

  const getEnhancedSnippet = () => {
    return `<a href="https://jobs.ondework.com/chat?company_id=${companyId}" 
  class="ondework-widget" 
  data-company-id="${companyId}">
    ${text}
  </a>
  <script
    id="ondework-enhance-loader"
    async
    defer
    src="https://cdn.ondework.com/enhance.js">
  </script>`;
  };

  const handleCopyStandard = () => {
    navigator.clipboard.writeText(getStandardSnippet()).then(() => {
      setCopiedStandard(true);
      setTimeout(() => setCopiedStandard(false), 1500);
    });
  };

  const handleCopyEnhanced = () => {
    navigator.clipboard.writeText(getEnhancedSnippet()).then(() => {
      setCopiedEnhanced(true);
      setTimeout(() => setCopiedEnhanced(false), 1500);
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

      <div className="pt-4 flex items-center gap-2">
        <button
          onClick={saveConfig}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Settings
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Embed Options</h3>
        
        {/* Method Selection */}
        <div className="mb-4">
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="embedMethod"
                value="standard"
                checked={selectedMethod === 'standard'}
                onChange={(e) => setSelectedMethod(e.target.value as EmbedMethod)}
                className="mr-2"
              />
              Standard Widget (Recommended)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="embedMethod"
                value="enhanced"
                checked={selectedMethod === 'enhanced'}
                onChange={(e) => setSelectedMethod(e.target.value as EmbedMethod)}
                className="mr-2"
              />
              Enhanced Link (For problematic sites)
            </label>
          </div>
        </div>

        {/* Standard Method */}
        {selectedMethod === 'standard' && (
          <div className="space-y-3">
            <div>
              <p className="font-medium text-green-700 mb-1">✅ Standard Widget</p>
              <p className="text-sm text-gray-600 mb-2">
                Best for: WordPress, static websites, most CMS platforms
              </p>
              <div className="bg-gray-100 rounded p-3 text-sm font-mono break-all">
                {getStandardSnippet()}
              </div>
              <button
                onClick={handleCopyStandard}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {copiedStandard ? 'Copied!' : 'Copy Standard Snippet'}
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Method */}
        {selectedMethod === 'enhanced' && (
          <div className="space-y-3">
            <div>
              <p className="font-medium text-blue-700 mb-1">🚀 Enhanced Link</p>
              <p className="text-sm text-gray-600 mb-2">
                Best for: Squarespace, Durable.co, Webflow, Wix, sites where standard widget does not appear
              </p>
              <div className="bg-gray-100 rounded p-3 text-sm font-mono break-all whitespace-pre-wrap">
                {getEnhancedSnippet()}
              </div>
              <button
                onClick={handleCopyEnhanced}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {copiedEnhanced ? 'Copied!' : 'Copy Enhanced Snippet'}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
          {selectedMethod === 'standard' ? (
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Copy the snippet above and paste it where you want the button to appear</p>
              <p>• For WordPress: Use in HTML/Code blocks or theme files</p>
              <p>• For static sites: Add directly to your HTML</p>
              <p className="mt-2 text-blue-600">
                <strong>Not working?</strong> Try the Enhanced Link option instead.
              </p>
            </div>
          ) : (
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Squarespace:</strong> Add to a Code Block in your page editor</p>
              <p>• <strong>Durable.co:</strong> Use the Embed/HTML component</p>
              <p>• <strong>Webflow:</strong> Add to an Embed element</p>
              <p>• <strong>Wix:</strong> Use the HTML iframe/embed element</p>
              <p className="mt-2 text-blue-600">
                <strong>Benefit:</strong> Link appears instantly, gets enhanced when script loads. Always reliable!
              </p>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Which Method Should I Use?</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Platform</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Standard Widget</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Enhanced Link</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">WordPress</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Recommended</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Also works</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Static HTML</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Recommended</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Also works</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Squarespace</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">⚠️ May need refresh</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Recommended</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Durable.co</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">⚠️ May need refresh</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Recommended</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Webflow</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">⚠️ May need refresh</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Recommended</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">Wix</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">⚠️ May need refresh</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">✅ Recommended</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}