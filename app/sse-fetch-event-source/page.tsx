'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchStream } from '@/app/utils/chat';

import styles from './page.module.css';

import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { debug } from 'console';

import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';

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

      class RetriableError extends Error {}
      class FatalError extends Error {}

      let text: string = '';
      const result = fetchEventSource(api, {
        method: 'POST',
        async onopen(response) {
          const type = response.headers.get('content-type');
          const type2 = 'text/event-stream;charset=UTF-8';
          // "text/event-stream
          debugger;
          if (response.ok && (type === EventStreamContentType || type == type2)) {
            return; // everything's good
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // client-side errors are usually non-retriable:
            throw new FatalError();
          } else {
            throw new RetriableError();
          }
        },
        onmessage(msg) {
          debugger;
          // if the server emits an error message, throw an exception
          // so it gets handled by the onerror callback below:
          if (msg.event === 'FatalError') {
            throw new FatalError(msg.data);
          }

          text += msg.data;

          setCurrentMessage(text);
        },
        onclose() {
          // if the server closes the connection unexpectedly, retry:
          console.log('closed');

          text += '\n结束了';
          setCurrentMessage(text);
          // throw new RetriableError();
        },
        onerror(err) {
          if (err instanceof FatalError) {
            throw err; // rethrow to stop the operation
          } else {
            // do nothing to automatically retry. You can also
            // return a specific retry interval here.
          }
        },
      });
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
      <div>这里用的是 fetch + @microsoft/fetch-event-source 实现的接口，它处理了 msg, data 数据</div>
      <br />
      <br />

      <div>{currentMessage}</div>
    </main>
  );
}
