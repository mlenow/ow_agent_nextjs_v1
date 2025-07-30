// public/enhance.js

(function() {
  // Prevent multiple initializations
  if (window.__ondeworkEnhanceLoaded) return;
  window.__ondeworkEnhanceLoaded = true;

  // Add base styles for enhanced buttons
  const style = document.createElement('style');
  style.innerHTML = `
    .ondework-widget {
      display: inline-block;
      padding: 12px 20px;
      background-color: #000;
      color: white;
      text-decoration: none !important;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: transform 0.2s ease, background-color 0.2s ease;
      margin-top: 16px;
      font-family: inherit;
      line-height: 1.2;
      vertical-align: middle;
    }
    .ondework-widget:hover {
      transform: scale(1.05);
      text-decoration: none !important;
    }
    .ondework-widget:focus {
      outline: 2px solid #007cba;
      outline-offset: 2px;
    }
    .ondework-widget:visited {
      color: inherit !important;
    }
  `;
  document.head.appendChild(style);

  const enhanceWidgets = async () => {
    const widgets = document.querySelectorAll('.ondework-widget:not([data-enhanced])');
    
    for (const link of widgets) {
      // Mark as enhanced immediately
      link.setAttribute('data-enhanced', 'true');
      
      const companyId = link.getAttribute('data-company-id');
      const originalHref = link.href;
      
      if (!companyId) {
        console.warn('OndeWork widget missing data-company-id attribute');
        continue;
      }

      // Apply default styling immediately (before API call)
      applyDefaultStyling(link);

      // Fetch company configuration and apply custom styling
      try {
        const apiUrl = `https://jobs.ondework.com/api/widget-config?company_id=${companyId}`;
        //console.log('🔍 Fetching widget config from:', apiUrl);
        
        const res = await fetch(apiUrl);
        
        //console.log('📡 Response status:', res.status);
        //console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          const errorText = await res.text();
          //console.log('❌ Error response body:', errorText);
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        let config;
        try {
          config = await res.json();
        } catch (parseError) {
          console.warn('❌ Invalid JSON returned from widget config API:', parseError);
          throw new Error('Invalid JSON');
        }
        
        // Apply custom styling from database
        applyCustomStyling(link, config);
        
      } catch (error) {
        console.warn('Could not fetch widget config, using defaults:', error);
        // Continue with default styling already applied
      }

      // Convert link to button behavior
      link.addEventListener('click', (e) => {
      e.preventDefault();

        const currentPageUrl = window.location.href;
        const fallbackUrl = `https://jobs.ondework.com/chat?company_id=${encodeURIComponent(companyId)}&referrer=${encodeURIComponent(currentPageUrl)}`;

        try {
          openChatModal(companyId, fallbackUrl);
        } catch (error) {
          console.error('OndeWork modal failed, opening in new tab:', error);
          window.open(fallbackUrl, '_blank');
        }
      });
    }
  };

  const applyDefaultStyling = (link) => {
    // Ensure it looks like a button immediately
    link.style.cssText = `
      display: inline-block !important;
      padding: 12px 20px !important;
      background-color: #000000 !important;
      color: #ffffff !important;
      text-decoration: none !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
      transition: transform 0.2s ease, background-color 0.2s ease !important;
      margin-top: 16px !important;
      font-family: inherit !important;
      line-height: 1.2 !important;
      vertical-align: middle !important;
    `;
  };

  const applyCustomStyling = (link, config) => {
    // Apply custom colors
    if (config.bgColor) {
      link.style.backgroundColor = config.bgColor + ' !important';
    }
    
    if (config.textColor) {
      link.style.color = config.textColor + ' !important';
    }
    
    // Apply custom shape
    if (config.shape) {
      const borderRadius = 
        config.shape === 'pill' ? '999px' :
        config.shape === 'rounded' ? '6px' : 
        config.shape === 'square' ? '0px' : '8px';
      link.style.borderRadius = borderRadius + ' !important';
    }
    
    // Apply custom text (but preserve existing text if it's been customized)
    if (config.buttonText) {
      const currentText = link.textContent.trim();
      const isDefaultText = currentText === 'Apply Now - Live Chat!' || 
                           currentText === 'Apply Now' || 
                           currentText === 'Chat with us' ||
                           currentText === '';
      
      if (isDefaultText) {
        link.textContent = config.buttonText;
      }
    }

    // Add hover effect with custom color
    if (config.bgColor) {
      const hoverColor = adjustBrightness(config.bgColor, -20);
      link.addEventListener('mouseenter', () => {
        link.style.backgroundColor = hoverColor + ' !important';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.backgroundColor = config.bgColor + ' !important';
      });
    }
  };

  // Helper function to darken/lighten colors for hover effect
  const adjustBrightness = (color, amount) => {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    
    if (col.length === 3) {
      // Convert 3-char hex to 6-char
      return '#' + col.split('').map(c => c + c).join('');
    }
    
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    
    return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  };

  const openChatModal = (companyId, fallbackUrl) => {
    const isMobile = window.innerWidth <= 480;

    const container = document.createElement('div');
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-label', 'Job Application Chat');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.background = 'rgba(0, 0, 0, 0.3)';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.padding = isMobile ? '0' : '16px';

    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const contentWrapper = document.createElement('div');
    contentWrapper.style.position = 'relative';
    contentWrapper.style.width = isMobile ? '100%' : '100%';
    contentWrapper.style.maxWidth = isMobile ? '100vw' : '420px';

    const iframe = document.createElement('iframe');
    const referrerParam = encodeURIComponent(window.location.href);
    iframe.src = `https://jobs.ondework.com/chat?company_id=${companyId}&referrer=${referrerParam}`;
    iframe.setAttribute('aria-label', 'OndeWork Chat Assistant');
    iframe.style.width = isMobile ? '100vw' : '100%';
    iframe.style.height = isMobile ? '100vh' : '90vh';
    iframe.style.border = 'none';
    iframe.style.borderRadius = isMobile ? '0px' : '10px';
    iframe.style.boxShadow = isMobile ? 'none' : '0 0 20px rgba(0,0,0,0.3)';
    iframe.style.background = '#fff';

    // Handle iframe load errors
    iframe.onerror = () => {
      console.warn('❌ iframe failed to load. Opening fallback in new tab.');
      container.remove();
      document.body.style.overflow = originalOverflow;

      // fallbackUrl already includes company_id and referrer
      window.open(fallbackUrl, '_blank');
    };

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
    closeBtn.style.transition = 'background-color 0.2s ease';

    closeBtn.onmouseover = () => closeBtn.style.background = '#f0f0f0';
    closeBtn.onmouseout = () => closeBtn.style.background = '#fff';

    const closeModal = () => {
      container.remove();
      document.body.style.overflow = originalOverflow;
    };

    closeBtn.onclick = closeModal;

    // Close on background click
    container.onclick = (e) => {
      if (e.target === container) closeModal();
    };

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    contentWrapper.appendChild(closeBtn);
    contentWrapper.appendChild(iframe);
    container.appendChild(contentWrapper);
    document.body.appendChild(container);

    // Focus management for accessibility
    closeBtn.focus();
  };

  // Run enhancement
  const runEnhancement = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', enhanceWidgets);
    } else {
      enhanceWidgets();
    }

    // Watch for dynamically added widgets (for SPAs)
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.classList?.contains('ondework-widget') || 
                  node.querySelector?.('.ondework-widget')) {
                shouldCheck = true;
              }
            }
          });
        });
        if (shouldCheck) {
          setTimeout(enhanceWidgets, 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  runEnhancement();
})();