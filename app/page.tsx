'use client';

import { MutableRefObject, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import styles from './page.module.css';

import { createParser } from 'eventsource-parser';
import { debug } from 'console';

export default function Home() {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function Uint8ArrayToString(array: any) {
    var out, i, len, c;
    var char2, char3;

    out = '';
    len = array.length;
    i = 0;
    while (i < len) {
      c = array[i++];
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12:
        case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
          break;
      }
    }

    return out;
  }

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
            if (json.content) {
              // debugger;
              // const text = json.choices[0].delta.content;
              const text = json.content;
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

      for await (const chunk of value) {
        // parser.feed(decoder.decode(chunk));
        // onmessage?.(chunk);
        // debugger;
      }
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
          // ?????
          new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text();
        })
        // .then((response) => response.blob())
        .catch((err) => console.error(err))
    );
  };

  const bodyStr = JSON.stringify({
    messages: [
      {
        role: 'user',
        content: '作为一名父亲，如何和女儿进行沟通，给出4个字的回答',
      },
    ],
  });

  fetchStream('http://localhost:8701/uv1/chat2', {
    method: 'POST',
    headers: {
      accept: 'text/event-stream',
      'Content-Type': 'application/json',
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
