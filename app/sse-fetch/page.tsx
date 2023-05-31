'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
          'Content-Type': 'application/json',
          accept: 'text/event-stream',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [],
          stream: true,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let packed;

      let text = '';
      while (!(packed = await reader?.read()!).done) {
        let result = decoder.decode(packed.value); // uint8array转字符串
        const lines = result.trim().split('\n\n'); // 拆分返回的行
        for (let i in lines) {
          let line = lines[i].substring(6); // 去掉开头的 data:
          if (line === '[DONE]') {
            // 结束
            break;
          }

          debugger
          let data = JSON.parse(line);
          let delta = data['choices'][0]['delta'];

          text += delta;

          setCurrentMessage(text);

          // 后面就是自己的业务逻辑了...
        }
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
