'use client';

import { useEffect } from 'react';

// Chatbase embed widget injection (client-side)
export default function ChatbaseWidget() {
  useEffect(() => {
    // Prevent duplicate injection (Next.js dev/strict-mode can mount twice)
    if (document.getElementById('chatbase-embed-script')) return;

    const w = window as unknown as {
      chatbase?: ((arg?: string) => string) & { q?: unknown[] };
      [key: string]: unknown;
    };



    type ChatbaseFn = ((arg?: string) => string) & { q?: unknown[][] };

    const wAny = w as unknown as Record<string, unknown>;
    const maybeChatbase = wAny.chatbase as ChatbaseFn | undefined;

    const getState = (maybeChatbase as unknown as ((arg: string) => string) | undefined)?.('getState');

    if (!maybeChatbase || getState !== 'initialized') {
      const chatbaseStub: ChatbaseFn = ((...arguments_: unknown[]) => {
        const q = (chatbaseStub.q ||= []);
        q.push(arguments_);
        return 'initialized';
      }) as ChatbaseFn;

      const proxied = new Proxy(chatbaseStub as unknown as Function, {
        get(target, prop: string) {
          if (prop === 'q') return (target as unknown as ChatbaseFn).q;
          return (...args: unknown[]) => (target as any)(prop, ...args);
        },
      });

      wAny.chatbase = proxied as unknown as ChatbaseFn;
    }



    const onLoad = () => {
      const script = document.createElement('script');
      script.src = 'https://www.chatbase.co/embed.min.js';
      script.id = 'eJDRVqd-4VuGXqPfELBPt';
      // domain is not part of the standard TS typings for HTMLScriptElement
      script.setAttribute('data-domain', 'www.chatbase.co');
      script.async = true;


      // Marker id to keep us from duplicating the embed script
      script.setAttribute('data-chatbase-embed', 'true');
      script.setAttribute('data-chatbase-marker-id', 'chatbase-embed-script');

      document.body.appendChild(script);

      // Create marker node (doesn't affect DOM styling)
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

