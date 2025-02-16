import './App.css'
import CountdownContainer from "./components/CountdownContainer.tsx";
import {useEffect, useState} from "react";
import TitleContainer from "./components/TitleContainer.tsx";
import {VscDebugStart, VscDebugStop} from "react-icons/vsc";
import {MdAdd, MdDeleteForever, MdOutlineExpandLess, MdOutlineExpandMore} from "react-icons/md";

type QueueItem = {
  title: string,
  minutes: number,
  seconds: number
}
function App() {

  const [countMs, setCountMs] = useState(0)
  const [title, setTitle] = useState('')
  const [countdownSize, setcountdownSize] = useState(parseInt(localStorage.getItem('countdownSize') as string??"18"))
  const [titleSize, settitleSize] = useState(parseInt(localStorage.getItem('titleSize') as string??"18"))
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [countdownKey, setCountdownKey] = useState(Math.random())
  const [overtime, setOvertime] = useState(localStorage.getItem('overtime') === 'true')
  const [countdownEnabled, setcountdownEnabled] = useState(false)
  const [queueDialog, setQueueDialog] = useState(false)
  const emptyElement: QueueItem = {title: '', minutes: 0, seconds: 0};
  const queueFromLocalstorage = JSON.parse(localStorage.getItem('queue')??JSON.stringify([emptyElement])) as QueueItem[];
  const [queue, setQueue] = useState<QueueItem[]>(queueFromLocalstorage)
  const [nextQueueIndex, setnextQueueIndex] = useState(0)
  const [enableAutoStart, setEnableAutoStart] = useState(false)
  const [autoStartTime, setAutoStartTime] = useState<string>()
  const [autoStartTimeout, setAutoStartTimeout] = useState<number>(0)

  useEffect(() => {
    if(queueDialog)
      return

    if (autoStartTimeout)
      clearTimeout(autoStartTimeout)

    if(!enableAutoStart || !autoStartTime || queue.length == 0)
      return

    const autoStartTimeArray = autoStartTime.split(":").map(Number)
    if(autoStartTimeArray.length !== 2) {
      return
    }

    const timeoutRemained = new Date().setHours(autoStartTimeArray[0], autoStartTimeArray[1], 0, 0) - Date.now()
    if(timeoutRemained < 0) {
      return
    }

    const timeout = setTimeout(() => {
      setCountdownKey(Math.random())
      setCountMs(queue[0].minutes * 60000 + queue[0].seconds * 1000)
      setcountdownEnabled(true)
      setTitle(queue[0].title)
      setnextQueueIndex(1)
    }, timeoutRemained);
    setAutoStartTimeout(timeout)
  }, [queueDialog]);

  const resetCountdown =() => {
    setCountdownKey(Math.random())
    setCountMs(minutes * 60000 + seconds * 1000)
    setcountdownEnabled(true)
  }
  const stopCountdown =() => {
    setCountdownKey(Math.random())
    setCountMs(0)
    setcountdownEnabled(false)
  }
  const updateCheckbox =
    (e: { target: { checked: boolean; }; }) => {
      setOvertime(e.target.checked)
      localStorage.setItem('overtime', String(e.target.checked))
    }
  const updateCountSize =
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setcountdownSize(parseInt(e.target.value) ?? 0)
      localStorage.setItem('countdownSize', String(parseInt(e.target.value) ?? 0))
    }
  const updateTitleSize =
    (e: React.ChangeEvent<HTMLInputElement>) => {
      settitleSize(parseInt(e.target.value) ?? 0)
      localStorage.setItem('titleSize', String(parseInt(e.target.value) ?? 0))
    }
  const setQueueUpdate = (newQueue: QueueItem[]) => {
    setQueue(newQueue)
    localStorage.setItem('queue', JSON.stringify(newQueue))
  }
  return (
      <>
        <div>
          <CountdownContainer ms={countMs} size={countdownSize} overtime={overtime} key={countdownKey} autoStart={countdownEnabled}/>
        </div>
        <div>
          <TitleContainer initTitle={title} size={titleSize}/>
        </div>
        <div className="control">
          <input type='number' value={minutes} size={2} min={0}  onInput={(e:React.ChangeEvent<HTMLInputElement>) => setMinutes(parseInt(e.target.value)??0)}/>
          <input type='number' value={seconds} size={2} min={0} max={59} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setSeconds(parseInt(e.target.value)??0)}/>
          <button onClick={resetCountdown}><VscDebugStart /></button>
          <button onClick={stopCountdown}><VscDebugStop /></button>
          <input type='checkbox' checked={overtime} onChange={updateCheckbox}/>overtime
          <input type='text' value={title} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}/>
          count size:<input type='number' value={countdownSize} min={1} onInput={updateCountSize}/>
          title size:<input type='number' value={titleSize} min={1} onInput={updateTitleSize}/>
          <button onClick={() => setQueueDialog(!queueDialog)}>Queue {queueDialog?<MdOutlineExpandLess/>:<MdOutlineExpandMore/>}</button>
          <div>nextQueue:{nextQueueIndex < queue.length ? <span><input type='number' value={nextQueueIndex}
                                                                       onInput={(e: React.ChangeEvent<HTMLInputElement>) => setnextQueueIndex(parseInt(e.target.value) ?? 0)}/>{queue[nextQueueIndex]?.title}
          </span> : 'finished'} </div>
          <button onClick={() => {
            if(queue.length <= nextQueueIndex) return
            setCountdownKey(Math.random())
            setCountMs(queue[nextQueueIndex].minutes * 60000 + queue[nextQueueIndex].seconds * 1000)
            setcountdownEnabled(true)
            setTitle(queue[nextQueueIndex].title)
            setnextQueueIndex(nextQueueIndex + 1)
          }}>next</button>
        </div>
        {queueDialog &&
          <div className="queueDialog">
              <div className="queue_content">
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1em'}}>
                      <h1>Queue</h1>
                      <button onClick={() => setQueueUpdate([...queue, emptyElement])}>
                          <MdAdd />
                      </button>
                  </div>
                  <div>
                      <input type='checkbox' checked={enableAutoStart}
                             onChange={(e) => setEnableAutoStart(e.target.checked)}/>
                    {enableAutoStart && <input type='time'
                                               value={autoStartTime}
                                               onInput={(e: React.ChangeEvent<HTMLInputElement>) => setAutoStartTime(e.target.value)}/>}
                  </div>
                  <table>
                      <thead>
                      <tr>
                          <th>#</th>
                          <th>title</th>
                          <th>min</th>
                          <th>sec</th>
                      </tr>
                      </thead>
                      <tbody>
                      {queue.map((item, index) =>
                        <tr key={index}>
                          <td>
                            {index+1}
                          </td>
                          <td>
                            <input type='text' value={item.title}
                                   onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                     queue[index].title = e.target.value
                                     setQueueUpdate([...queue])
                                   }}/></td>
                          <td>
                            <input type='number' value={item.minutes}
                                   onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                     queue[index].minutes = parseInt(e.target.value) ?? 0
                                     setQueueUpdate([...queue])
                                   }}/></td>
                          <td>
                            <input type='number' value={item.seconds}
                                   onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                     queue[index].seconds = parseInt(e.target.value) ?? 0
                                     setQueueUpdate([...queue])
                                   }}/></td>
                          <td>
                            <button onClick={() => setQueueUpdate(queue.filter((_, i) => i !== index))}>
                              <MdDeleteForever/>
                            </button>
                          </td>
                        </tr>
                      )}
                      </tbody>
                  </table>
              </div>
          </div>
        }
      </>
  )
}

export default App
