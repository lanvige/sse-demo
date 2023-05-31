'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import styles from './page.module.css';

import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { debug } from 'console';

import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const handleSend = useCallback(async () => {
    debugger;
    const decoder = new TextDecoder('utf-8');

    const api: string = process.env.NEXT_PUBLIC_UNICHAT_API!;

    try {
      const bodyStr = JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '作为一名父亲，如何和女儿进行沟通，给出80个字的回答',
          },
        ],
      });

      class RetriableError extends Error {}
      class FatalError extends Error {}

      let text: string = '';

      const abortController = new AbortController();

      const eventSource = fetchEventSource(api, {
        method: 'POST',
        body: bodyStr,
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          accept: 'text/event-stream',
        },
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
          // debugger;
          // if the server emits an error message, throw an exception
          // so it gets handled by the onerror callback below:
          if (msg.event === 'FatalError') {
            throw new FatalError(msg.data);
          }

          const json = JSON.parse(msg.data);
          debugger;

          if (json.data == '[DONE]') {
            abortController.abort();
            console.log('我是结束！！');
            return;
          }

          // debugger;
          if (json.content) {
            text += json.content;

            console.log(text);
            setCurrentMessage(text);
          }
        },
        onclose() {
          debugger;
          // if the server closes the connection unexpectedly, retry:
          console.log('closed');

          text += '\n结束了';
          setCurrentMessage(text);
          // throw new RetriableError();

          console.log('close');
          abortController.abort();

          // eventSource.close();
        },
        onerror(err) {
          debugger;
          // if (err instanceof FatalError) {
          //   throw err; // rethrow to stop the operation
          // } else {
          //   // do nothing to automatically retry. You can also
          //   // return a specific retry interval here.
          // }

          abortController.abort();
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
