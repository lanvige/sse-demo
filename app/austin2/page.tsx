'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import styles from './page.module.css';
import req from './req';

// import { createParser } from 'eventsource-parser';
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

  const OpenAIStream = async () => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const bodyStr = JSON.stringify({
      contents: ['作为一名父亲，如何和女儿进行沟通，给出4个字的回答'],
      stream: true,
    });

    const res = await fetch(`https://aitoolapi.axiig.com/chat`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer test-key}`,
      },
      method: 'POST',
      body: bodyStr,
    });

    if (res.status !== 200) {
      throw new Error('OpenAI API returned an error');
    }

    const stream = new ReadableStream({
      async start(controller) {
        const onParse = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === 'event') {
            const data = event.data;

            if (data === '[DONE]') {
              controller.close();
              return;
            }

            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta.content;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        };

        const parser = createParser(onParse);

        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });

    return stream;
  };

  const response: any = req();

  if (!response.ok) {
    homeDispatch({ field: 'loading', value: false });
    homeDispatch({ field: 'messageIsStreaming', value: false });
    toast.error(response.statusText);
    return;
  }

  const a = new Response(stream);
  return new Response(stream);
  fetchStream('https://aitoolapi.axiig.com/chat', {
    method: 'POST',
    headers: {
      accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: 'Bearer x',
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