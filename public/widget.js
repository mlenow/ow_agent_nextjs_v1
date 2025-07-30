//public/widget.js

(function () {
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"][data-company-id]');
  const publicId = scriptTag?.getAttribute('data-company-id');

  if (!scriptTag || !publicId) return;

  // Check if THIS specific script tag already has a widget
  if (scriptTag.hasAttribute('data-widget-processed')) {
    return;
  }

  // Mark this script as processed immediately
  // Delay marking this script as processed until after hydration
  requestAnimationFrame(() => {
    scriptTag.setAttribute('data-widget-processed', 'true');
  });

  // Add styles once per page (not per widget)
  if (!document.querySelector('#ondework-widget-styles')) {
    const style = document.createElement('style');
    style.id = 'ondework-widget-styles';
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
  }

  // Central coordination - only one button per script
  let buttonCreated = false;
  let attempts = 0;
  const maxAttempts = 15;
  let allTimers = [];
  let observer = null;

  const cleanup = () => {
    // Stop all timers
    allTimers.forEach(clearTimeout);
    allTimers = [];
    
    // Stop observer
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const createButton = async () => {
    // Prevent multiple creations
    if (buttonCreated) {
      cleanup();
      return;
    }

    attempts++;
    if (attempts > maxAttempts) {
      cleanup();
      return;
    }

    // Check if script is properly placed
    if (!scriptTag.parentNode) {
      return false; // Not ready yet
    }

    try {
      const apiOrigin = 'https://jobs.ondework.com'; // always serves the API
      const res = await fetch(`${apiOrigin}/api/widget-config?company_id=${publicId}`);
      const config = await res.json();

      // Final check before creating
      if (buttonCreated) {
        cleanup();
        return;
      }

      const button = document.createElement('button');
      button.className = 'ondework-chat-button';
      button.setAttribute('data-ondework-widget', publicId);
      button.innerText = config.buttonText || 'Apply Now!';
      button.style.backgroundColor = config.bgColor || '#000';
      button.style.color = config.textColor || '#fff';
      button.style.borderRadius =
        config.shape === 'pill' ? '999px' :
        config.shape === 'rounded' ? '6px' : '0px';

      button.onclick = () => {
        const isMobile = window.innerWidth <= 480;

        const container = document.createElement('div');
        container.setAttribute('role', 'dialog');
        container.setAttribute('aria-modal', 'true');
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.background = 'rgba(0,0,0,0.3)';
        container.style.zIndex = '9998';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.padding = isMobile ? '0' : '16px';

        document.body.style.overflow = 'hidden';

        const contentWrapper = document.createElement('div');
        contentWrapper.style.position = 'relative';
        contentWrapper.style.width = isMobile ? '100%' : '100%';
        contentWrapper.style.maxWidth = isMobile ? '100vw' : '420px';

        const iframe = document.createElement('iframe');
        iframe.src = `https://jobs.ondework.com/chat?company_id=${publicId}&referrer=${encodeURIComponent(window.location.href)}`;
        iframe.loading = 'lazy';
        iframe.setAttribute('aria-label', 'OndeWork Chat Assistant');
        iframe.style.width = isMobile ? '100vw' : '100%';
        iframe.style.height = isMobile ? '100vh' : '90vh';
        iframe.style.border = 'none';
        iframe.style.borderRadius = isMobile ? '0px' : '10px';
        iframe.style.boxShadow = isMobile ? 'none' : '0 0 20px rgba(0,0,0,0.3)';
        iframe.style.background = '#fff';

        const closeBtn = document.createElement('button');
        closeBtn.innerText = '×';
        closeBtn.setAttribute('aria-label', 'Close chat');
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = isMobile ? '16px' : '10px';
        closeBtn.style.right = isMobile ? '16px' : '10px';
        closeBtn.style.zIndex = '1000';
        closeBtn.style.fontSize = isMobile ? '28px' : '24px';
        closeBtn.style.padding = isMobile ? '10px 14px' : '8px 12px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.border = 'none';
        closeBtn.style.background = '#fff';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        closeBtn.onclick = () => {
          document.body.removeChild(container);
          document.body.style.overflow = '';
        };

        container.onclick = (e) => {
          if (e.target === container) closeBtn.click();
        };

        contentWrapper.appendChild(closeBtn);
        contentWrapper.appendChild(iframe);
        container.appendChild(contentWrapper);
        document.body.appendChild(container);
      };

      // Insert button
      scriptTag.parentNode.insertBefore(button, scriptTag.nextSibling);
      buttonCreated = true;
      cleanup();
      return true;
      
    } catch (err) {
      console.error('❌ OndeWork widget failed:', err);
      return false;
    }
  };

  // Coordinated retry function
  const tryCreateButton = () => {
    if (buttonCreated || attempts >= maxAttempts) {
      cleanup();
      return;
    }

    createButton().then(success => {
      if (!success && !buttonCreated && attempts < maxAttempts) {
        // Schedule next attempt with exponential backoff
        const delay = Math.min(attempts * 300, 2000); // Max 2 second delay
        const timer = setTimeout(tryCreateButton, delay);
        allTimers.push(timer);
      }
    });
  };

  // Set up MutationObserver for dynamic sites (but coordinated)
  if (window.MutationObserver && !buttonCreated) {
    observer = new MutationObserver((mutations) => {
      if (buttonCreated) {
        cleanup();
        return;
      }

      // Only trigger on significant changes
      let shouldRetry = false;
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.tagName && node.tagName !== 'SCRIPT') {
              shouldRetry = true;
            }
          });
        }
      });
      
      if (shouldRetry) {
        // Debounced retry
        allTimers.forEach(clearTimeout);
        const timer = setTimeout(tryCreateButton, 200);
        allTimers = [timer];
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initial attempts with coordination
  const scheduleAttempt = (delay) => {
    if (!buttonCreated && attempts < maxAttempts) {
      const timer = setTimeout(tryCreateButton, delay);
      allTimers.push(timer);
    }
  };

  // Start trying immediately
  tryCreateButton();

  // Standard DOM events (but coordinated)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryCreateButton);
  }
  window.addEventListener('load', tryCreateButton);

  // Scheduled fallbacks for dynamic sites
  scheduleAttempt(1000);  // 1 second
  scheduleAttempt(3000);  // 3 seconds  
  scheduleAttempt(5000);  // 5 seconds

})();