//public/widget.js

(function () {
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"][data-company-id]');
  const publicId = scriptTag?.getAttribute('data-company-id');
  const origin = scriptTag?.src.split('/widget.js')[0];

  if (!scriptTag) {
  console.error('❌ OndeWork widget: script tag not found.');
  return;
  }

  if (!publicId || !origin) return;

  // Add basic styles (if needed)
  const style = document.createElement('style');
  style.innerHTML = `
    .ondework-chat-button {
      margin-top: 16px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      border: none;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: transform 0.2s ease;
      display: inline-block;
    }
    .ondework-chat-button:hover {
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(style);

  const init = async () => {
    try {
      const res = await fetch(`${origin}/api/widget-config?company_id=${publicId}`);
      const config = await res.json();

      const button = document.createElement('button');
      button.className = 'ondework-chat-button';
      button.innerText = config.buttonText || 'Apply Now!';
      button.style.backgroundColor = config.bgColor || '#000';
      button.style.color = config.textColor || '#fff';
      button.style.borderRadius =
        config.shape === 'pill' ? '999px' :
        config.shape === 'rounded' ? '6px' : '0px';

      button.onclick = () => {
        const container = document.createElement('div');
        container.setAttribute("role", "dialog");
        container.className = "ondework-modal";
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.background = 'rgba(0, 0, 0, 0.3)'; // Change to 'transparent' if you want no overlay
        container.style.zIndex = '9998';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        
        // Iframe
        const iframe = document.createElement('iframe');
        iframe.src = `${origin}/chat?company_id=${publicId}`;
        iframe.loading = "lazy";
        iframe.style.width = '100%';
        iframe.style.maxWidth = '420px';
        iframe.style.height = '90vh';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        iframe.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        iframe.style.background = '#fff';
        iframe.title = "Chat Assistant";

        container.appendChild(iframe);
        document.body.appendChild(container);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerText = '×';
        closeBtn.style.position = 'fixed';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.zIndex = '10000';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.padding = '8px 12px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.border = 'none';
        closeBtn.style.background = '#fff';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        closeBtn.onclick = () => {
          // Attempt to clean up iframe content before removal
          iframe.contentWindow?.postMessage({ type: 'shutdown' }, '*');
          setTimeout(() => {
            document.body.removeChild(container);
          }, 100); // give the iframe time to process the shutdown
        };
        container.appendChild(closeBtn);
      };

      scriptTag?.parentElement?.appendChild(button);
    } catch (err) {
      console.error('❌ OndeWork widget failed:', err);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();