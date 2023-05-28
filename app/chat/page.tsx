'use client';

import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import styles from './page.module.css';

import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';
import { debug } from 'console';

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const fetchStream = async (url: string, params: any) => {
    const { onmessage, onclose, ...otherParams } = params;

    // ????
    const pump = async (controller: any, reader: any) => {
      // 调用 read() ，它返回一个包含 results 对象的 Promise ——它包含我们读取的结果，形式为 { done, value }
      const { value, done } = await reader.read();

      debugger;

      // ??? Uncaught (in promise) TypeError: Failed to execute 'close' on 'ReadableStreamDefaultController': Cannot close a readable stream that has already been requested to be closed
      if (done) {
        debugger;
        // controller.close();
        debugger;
        onclose?.();
        return;
      }

      // 这是一个 callback 方法，会在调用 feed 后，进行分行处理，这里的参数是一个单个的 event
      const parseCallback = async (event: ParsedEvent | ReconnectInterval) => {
        // debugger;
        // 只处理 event 类型
        if (event.type === 'event') {
          const data = event.data;
          const eventId = event.id;

          if (eventId === '[TOKENS]') {
            return;
          }

          // debugger;

          if (data === '[DONE]') {
            // controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            if (json.content) {
              // debugger;
              // const text = json.choices[0].delta.content;
              const text = json.content;
              // debugger;
              onmessage?.(text);

              // 将下一个数据块排队到我们的目标流中
              // const queue = encoder.encode(text);
              // controller.enqueue(queue);
              // if (eventId === '[DONE]') {
              //   // const queue = encoder.encode(text);
              //   // controller.enqueue(queue);
              //   // 然后再次调用 pump() 函数去读取下一个分块。
              //   // await pump(controller, reader);
              //   return;
              // }
            }
          } catch (err) {
            debugger;
            controller.error(err);
          }
        }
      };

      const parser = createParser(parseCallback);
      // feed 的参数是一个或多个 event，它有一个 parseEventStreamLine 的方法来处理单个 event，每个 event 都会执行 callback
      await parser.feed(decoder.decode(value));

      // for await (const chunk of value) {
      //   // parser.feed(decoder.decode(chunk));
      //   // onmessage?.(chunk);
      //   // debugger;
      // }

      const b = decoder.decode(value);
      controller.enqueue(value);
      // 然后再次调用 pump() 函数去读取下一个分块。
      await pump(controller, reader);
    };

    // https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Using_readable_streams
    // 发送请求，使用参数中的 header
    return (
      fetch(url, otherParams)
        .then((response: any) => {
          // 以 ReadableStream 解析数据
          const reader = response.body.getReader();

          // 创建一个 ReadableStream，并调用 start 立即执行
          const stream = new ReadableStream({
            start(controller) {
              pump(controller, reader);
            },
          });

          return stream;
        })
        // 从流中创建一个新的响应
        // Create a new response out of the stream
        .then((stream) => {
          // 返对一个对象
          new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
        })
        // .then((response) => response.blob())
        .catch((err) => console.error(err))
    );
  };

  useEffect(() => {
    const bodyStr = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: '作为一名父亲，如何和女儿进行沟通，给出40个字的回答',
        },
      ],
    });

    const a = fetchStream('http://localhost:8701/uv1/chat2', {
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: bodyStr,
      onmessage: (res: string) => {
        // todo
        // const queue = encoder.encode(res);
        setCurrentMessage((r: any) => r + res);
        console.log(res);
      },
      // onclose: (res: string) => {
      //   // todo
      //   debugger;
      //   setCurrentMessage((r: any) => r + '已关闭');
      //   console.log(res);
      // },
    });
  }, []);

  // console.log(a);
  debugger;

  // ================== res

  return (
    <main className={styles.main}>
      <div>{currentMessage}</div>
    </main>
  );
}
