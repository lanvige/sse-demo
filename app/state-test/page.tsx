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

  console.log("00000000000000")

  // setState 会导致页面重新渲染
  setCurrentMessage("1111")

  // ================== res

  return (
    <main className={styles.main}>
      <div>{currentMessage}</div>
    </main>
  );
}
