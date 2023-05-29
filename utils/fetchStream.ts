import RequestInit from './requestInit';
import { ParsedEvent, ReconnectInterval, createParser } from 'eventsource-parser';

const fetchStream = async (url: string, params: RequestInit): Promise<Response | void> => {
  const { onMessage, onClose, ...otherParams } = params;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');

  // pump
  const pump = async (controller: any, reader: any) => {
    // 调用 read() ，它返回一个包含 results 对象的 Promise ——它包含我们读取的结果，形式为 { done, value }
    const { value, done } = await reader.read();

    // Uncaught (in promise) TypeError: Failed to execute 'close' on 'ReadableStreamDefaultController': Cannot close a readable stream that has already been requested to be closed
    if (done) {
      // controller.close();
      onClose?.();
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

        if (data === '[DONE]') {
          // controller.close();
          return;
        }

        try {
          const json = JSON.parse(data);
          debugger;
          if (json.content) {
            // const text = json.choices[0].delta.content;
            const text = json.content;
            onMessage?.(text);

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

    const b = decoder.decode(value);
    controller.enqueue(value);
    // 然后再次调用 pump() 函数去读取下一个分块。
    await pump(controller, reader);
  };

  // https://developer.mozilla.org/zh-CN/docs/Web/API/Streams_API/Using_readable_streams
  // 发送请求，使用参数中的 header
  return (
    fetch(url, otherParams)
      .then((response: Response) => {
        // 应该让客户端自己处理，或者这里使用自定义 Error
        if (response.status !== 200) {
          return response;
          // throw new Error(response.status.toString());
        }

        // 以 ReadableStream 解析数据
        const reader = response.body?.getReader();

        // 创建一个 ReadableStream，并调用 start 立即执行
        const stream = new ReadableStream({
          start(controller) {
            pump(controller, reader);
          },
        });

        // 返回当前对象
        return response;
      })
      // 从流中创建一个新的响应
      // Create a new response out of the stream
      // .then((stream: ReadableStream) => {
      //   debugger;
      //   // 返对一个对象
      //   // return new Response(stream, { headers: { 'Content-Type': 'text/html' } });
      // })
      // .then((response) => response.blob())
      .catch((err) => {
        console.error(err);
        throw err;
      })
  );
};

export { fetchStream };
