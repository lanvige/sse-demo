'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';

import Image from 'next/image';
import styles from './page.module.css';

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

      // if (done) {
      //   controller.close();
      //   onclose?.();
      // } else {
      //   const s = Uint8ArrayToString(value);
      //   const s2 = decoder.decode(value);
      //   debugger;
      //   await onmessage?.(s);
      //   // Enqueue the next data chunk into our target stream
      //   controller.enqueue(value);
      //   pump(controller, reader);
      // }

      // ??? Uncaught (in promise) TypeError: Failed to execute 'close' on 'ReadableStreamDefaultController': Cannot close a readable stream that has already been requested to be closed
      if (done) {
        debugger;
        // controller.close();
        onclose?.();
        return;
      }

      // 替换旧的方法，用一个库来处理这个
      const parseCallback = async (event: any) => {
        debugger;
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
            if (json.choices) {
              // debugger;
              const text = json.choices[0].delta.content;
              // const text = json.content;
              // debugger;
              onmessage?.(text);

              // 将下一个数据块排队到我们的目标流中
              // const queue = encoder.encode(text);
              // controller.enqueue(queue);
              if (eventId === '[DONE]') {
                const queue = encoder.encode(text);
                controller.enqueue(queue);
                await pump(controller, reader);
                return;
              }
            }
          } catch (err) {
            debugger;
            controller.error(err);
          }
        }
      };

      const parser = createParser(parseCallback);
      await parser.feed(decoder.decode(value));

      // for await (const chunk of value) {
      //   // parser.feed(decoder.decode(chunk));
      //   // onmessage?.(chunk);
      //   // debugger;
      // }

      debugger;
      const b = decoder.decode(value);
      console.log(b);
      // controller.enqueue(value);
      // await pump(controller, reader);
    };

    // https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Using_readable_streams
    // 发送请求，使用参数中的 header
    fetch(url, otherParams).then((response: any) => {
      debugger;
      // 以 ReadableStream 解析数据
      const reader = response.body.getReader();

      const stream = new ReadableStream({
        async start(controller) {
          const onParse = (event: ParsedEvent | ReconnectInterval) => {
            debugger;
            if (event.type === 'event') {
              const data = event.data;
              if (data === '[DONE]') {
                controller.close();
                onclose?.();
                return;
              }

              try {
                const json = JSON.parse(data);
                const text = json.choices[0].delta.content;
                onmessage?.(text);
                const queue = encoder.encode(text);
                controller.enqueue(queue);
              } catch (e) {
                controller.error(e);
              }
            }
          };

          const bbb = reader.getReader();
          debugger;

          const parser = createParser(onParse);

          for await (const chunk of reader as any) {
            debugger;
            parser.feed(decoder.decode(chunk));
          }
        },
      });

      return stream;
    });
  };

  const bodyStr = JSON.stringify({
    contents: ['作为一名父亲，如何和女儿进行沟通，给出4个字的回答'],
    stream: true,
  });

  debugger;
  fetchStream('https://aitoolapi.axiig.com/chat', {
    method: 'POST',
    headers: {
      accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: 'Bearer t',
    },
    body: bodyStr,
    onmessage: (res: string) => {
      // todo
      // const queue = encoder.encode(res);
      // debugger;
      setCurrentMessage((r: any) => r + res);
      console.log(res);
    },
    onclose: (res: string) => {
      // todo
      debugger;
      setCurrentMessage((r: any) => r + '已关闭');
      console.log(res);
    },
  });

  // ================== res

  return (
    <main className={styles.main}>
      <div>{currentMessage}</div>
    </main>
  );
}
