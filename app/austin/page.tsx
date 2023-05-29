'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchStream } from '@/app/utils/fetchStream';

import Image from 'next/image';
import styles from './page.module.css';

import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { debug } from 'console';

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const handleSend = useCallback(async () => {
    const bodyStr = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: '作为一名父亲，如何和女儿进行沟通，给出4个字的回答',
        },
      ],
    });

    try {
      const abortController = new AbortController();

      const response = await fetchStream('http://localhost:8701/uv1/chat2', {
        method: 'POST',
        headers: {
          accept: 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: bodyStr,
        signal: abortController.signal,
        onmessage: (res: string) => {
          setCurrentMessage((r: any) => r + res);
          console.log(res);
        },
        onclose: () => {
          debugger;
          // setCurrentMessage((r: any) => r + '已关闭');
          console.log('已关闭');
        },
      });

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
