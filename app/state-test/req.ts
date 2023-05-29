import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';

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

const handler = async () => {
  debugger;

  try {
    const stream = await OpenAIStream();

    return new Response(stream);
  } catch (error) {
    console.error(error);
  }
};

export default handler;
