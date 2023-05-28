'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchStream } from '@/app/utils/chat';

import styles from './page.module.css';

import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { debug } from 'console';

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const handleSend = useCallback(async () => {
    const decoder = new TextDecoder('utf-8');

    try {
      const bodyStr = JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '作为一名父亲，如何和女儿进行沟通，给出4个字的回答',
          },
        ],
      });

      const abortController = new AbortController();

      const response = await fetch('http://localhost:8701/uv1/sse/fetch', {
        method: 'POST',
        headers: {
          accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: bodyStr,
      });

      // 这个时候，fetch 接收到的是 stream
      const reader = response.body?.getReader();

      while (true) {
        const { value, done } = await reader?.read()!;

        if (done) {
          debugger;
          break;
        }

        const a = decoder.decode(value);
        console.log('Received', a);
      }

      console.log(response);
      debugger;

      // 如果请求错误
      if (!response?.ok) {
        console.error(response?.statusText!);
        return;
      }

      // 如果没有数据
      const data = response.body;

      if (!data) {
        console.error(data);
        return;
      }
    } catch (err) {
      console.log(err);
      debugger;
    }
  }, []);

  useEffect(() => {
    handleSend();
  }, []);

  // ================== res

  return (
    <main className={styles.main}>
      <div>{currentMessage}</div>
    </main>
  );
}
