'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchStream } from '@/app/utils/fetchStream';

import styles from './page.module.css';

import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { debug } from 'console';

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const handleSend = useCallback(async () => {
    const decoder = new TextDecoder('utf-8');

    const api: string = process.env.NEXT_PUBLIC_UNICHAT_API!;

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

      const response = await fetch(api, {
        method: 'POST',
        headers: {
          accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: bodyStr,
      });

      // 这个时候，fetch 接收到的是 stream
      const reader = response.body?.getReader();

      let text = '';

      while (true) {
        const { value, done } = await reader?.read()!;

        if (done) {
          debugger;
          break;
        }

        const a = decoder.decode(value);
        console.log('Received', a);
        text += a;

        setCurrentMessage(text);
      }

      console.log(response);

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
    <main>
      <h2 className={`text-2xl`}>sse-fetch</h2>
      <div>这里用的是 fetch + whie 实现的接口，没有对数据进行过多的处理</div>
      <br />
      <br />

      <div>{currentMessage}</div>
    </main>
  );
}
