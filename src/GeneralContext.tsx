import {createContext, useEffect, useState} from "react";

export type GeneralContent = {
  countMs: number,
  setCountMs: (value: number) => void,
  title: string,
  setTitle: (value: string) => void,
  countdownSize: number,
  setcountdownSize: (value: number) => void,
  titleSize: number,
  settitleSize: (value: number) => void,
  minutes: number,
  setMinutes: (value: number) => void,
  seconds: number,
  setSeconds: (value: number) => void,
  showMinusTime: boolean,
  setShowMinusTime: (value: boolean) => void,
  queueDialog: boolean,
  setQueueDialog: (value: boolean) => void,
  queue: QueueItem[],
  setQueue: (value: QueueItem[]) => void,
  nextQueueIndex: number,
  setnextQueueIndex: (value: number) => void,
  enableAutoStart: boolean,
  setEnableAutoStart: (value: boolean) => void,
  autoStartTime: string | undefined,
  setAutoStartTime: (value: string | undefined) => void,
  autoStartTimeout: number,
  setAutoStartTimeout: (value: number) => void,
}

export type QueueItem = {
  title: string,
  minutes: number,
  seconds: number
}

const defaultValue = {};
export const generalContext = createContext<GeneralContent>(defaultValue as GeneralContent);

export const emptyElement: QueueItem = {title: '', minutes: 0, seconds: 0};

const defaultValues = {
  minutes: 1,
  seconds: 0,
  countdownSize: 23,
  titleSize: 23,
}
const numberFromLS = (key: string, defaultValue: number) => {
  const value = localStorage.getItem(key)
  if (value === null) {
    return defaultValue
  }
  const n = parseInt(value)
  if (isNaN(n)) {
    return defaultValue
  }
  return n
}
const GeneralContextProvider = ({children}: { children: React.ReactNode }) => {
  const [countMs, setCountMs] = useState(0)
  const [title, setTitle] = useState('')
  const [countdownSize, setcountdownSize] = useState(numberFromLS('countdownSize', defaultValues.countdownSize))
  const [titleSize, settitleSize] = useState(numberFromLS('titleSize', defaultValues.titleSize))
  const [minutes, setMinutes] = useState(defaultValues.minutes)
  const [seconds, setSeconds] = useState(defaultValues.seconds)
  const [showMinusTime, setShowMinusTime] = useState(localStorage.getItem('showMinusTime') === 'true')
  const [queueDialog, setQueueDialog] = useState(false)
  const queueFromLocalstorage = JSON.parse(localStorage.getItem('queue') ?? JSON.stringify([emptyElement])) as QueueItem[];
  const [queue, setQueue] = useState<QueueItem[]>(queueFromLocalstorage)
  const [nextQueueIndex, setnextQueueIndex] = useState(0)
  const [enableAutoStart, setEnableAutoStart] = useState(false)
  const [autoStartTime, setAutoStartTime] = useState<string>()
  const [autoStartTimeout, setAutoStartTimeout] = useState<number>(0)


  useEffect(() => {
    if (queueDialog)
      return

    if (autoStartTimeout)
      clearTimeout(autoStartTimeout)

    if (!enableAutoStart || !autoStartTime || queue.length == 0)
      return

    const autoStartTimeArray = autoStartTime.split(":").map(Number)
    if (autoStartTimeArray.length !== 2) {
      return
    }

    const timeoutRemained = new Date().setHours(autoStartTimeArray[0], autoStartTimeArray[1], 0, 0) - Date.now()
    if (timeoutRemained <= 0) {
      return
    }

    const timeout = setTimeout(() => {
      setCountMs(queue[0].minutes * 60000 + queue[0].seconds * 1000)
      setTitle(queue[0].title)
      setnextQueueIndex(1)
    }, timeoutRemained);
    setAutoStartTimeout(timeout)
  }, [queueDialog]);

  useEffect(() => {
    localStorage.setItem('queue', JSON.stringify(queue))
  }, [queue]);
  useEffect(() => {
    localStorage.setItem('showMinusTime', String(showMinusTime))
  }, [showMinusTime]);
  useEffect(() => {
    localStorage.setItem('countdownSize', String(countdownSize))
  }, [countdownSize]);
  useEffect(() => {
    localStorage.setItem('titleSize', String(titleSize))
  }, [titleSize]);

  return (
    <generalContext.Provider value={{
      countMs, setCountMs,
      title, setTitle,
      countdownSize, setcountdownSize,
      titleSize, settitleSize,
      minutes, setMinutes,
      seconds, setSeconds,
      showMinusTime, setShowMinusTime,
      queueDialog, setQueueDialog,
      queue, setQueue,
      nextQueueIndex, setnextQueueIndex,
      enableAutoStart, setEnableAutoStart,
      autoStartTime, setAutoStartTime,
      autoStartTimeout, setAutoStartTimeout
    }}>
      {children}
    </generalContext.Provider>
  );
}
export default GeneralContextProvider;