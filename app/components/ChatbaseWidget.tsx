'use client';

import { useEffect } from 'react';

type ChatbaseFn = ((arg?: string) => string) & { q?: unknown[][] };

export default function ChatbaseWidget() {
  useEffect(() => {
    if (document.getElementById('chatbase-embed-script')) return;

    const w = window as unknown as Record<string, unknown>;
    const maybeChatbase = w.chatbase as ChatbaseFn | undefined;
    const getState = typeof maybeChatbase === 'function' ? (maybeChatbase as (arg: string) => string)('getState') : undefined;

    if (!maybeChatbase || getState !== 'initialized') {
      const chatbaseStub: ChatbaseFn = ((...arguments_: unknown[]) => {
        const q = (chatbaseStub.q ||= []);
        q.push(arguments_);
        return 'initialized';
      }) as ChatbaseFn;

      const proxied = new Proxy(chatbaseStub as ChatbaseFn, {
        get(target, prop: string | symbol) {
          if (prop === 'q') return (target as ChatbaseFn).q;
          return (...args: unknown[]) => (target as unknown as (...a: unknown[]) => unknown)(String(prop), ...args);
        },
      });

      w.chatbase = proxied as ChatbaseFn;
    }

    const onLoad = () => {
      const script = document.createElement('script');
      script.src = 'https://www.chatbase.co/embed.min.js';
      script.id = 'eJDRVqd-4VuGXqPfELBPt';
      script.setAttribute('data-domain', 'www.chatbase.co');
      script.async = true;
      script.setAttribute('data-chatbase-embed', 'true');
      script.setAttribute('data-chatbase-marker-id', 'chatbase-embed-script');
      document.body.appendChild(script);

      const marker = document.createElement('div');
      marker.id = 'chatbase-embed-script';
      marker.style.display = 'none';
      document.body.appendChild(marker);
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }
  }, []);

  return null;
}

