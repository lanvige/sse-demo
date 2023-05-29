import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left'>
        <Link
          href='/sse-fetch'
          className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
          rel='noopener noreferrer'
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            sse-fetch{' '}
            <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>通过 whild 实现的 sse 数据获取</p>
        </Link>

        <br />

        <Link
          href='/sse-fetch-event-source'
          className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
          rel='noopener noreferrer'
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            sse-fetch-event-source
            <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            通过 @microsoft/fetch-event-source 实现的 sse 数据获取
          </p>
        </Link>

        <br />

        <Link
          href='/sse-fetch-stream'
          className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
          rel='noopener noreferrer'
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            sse-fetch-stream
            <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            通过 自定义的 fetch-stream 实现的 sse 数据获取
          </p>
        </Link>

        <br />


        <Link
          href='/chat'
          className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
          rel='noopener noreferrer'
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            sse-fetch{' '}
            <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>通过 chat 接口数据获取，目前用的是 ReadableStream + eventsource-parser</p>
        </Link>
      </div>
    </main>
  );
}
