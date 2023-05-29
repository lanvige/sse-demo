'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchStream } from '@/utils/fetchStream';

import styles from './page.module.css';

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const api: string = process.env.NEXT_PUBLIC_UNICHAT_API!;

  const handleSend = useCallback(async () => {
    const bodyStr = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: '作为一名父亲，如何和女儿进行沟通，给出40个字的回答',
        },
      ],
    });

    let textResp = '';

    const a = fetchStream(api, {
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: bodyStr,
      onMessage: (res: string) => {
        // todo
        // const queue = encoder.encode(res);
        // setCurrentMessage((r: any) => r + res);
        textResp = textResp + res;
        console.log(textResp);
        setCurrentMessage(textResp);
      },
      onClose: () => {
        // todo
        debugger;
        setCurrentMessage((r: any) => r + '已关闭');
        console.log();
      },
    });
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
