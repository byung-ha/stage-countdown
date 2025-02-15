import './App.css'
import CountdownContainer from "./components/CountdownContainer.tsx";
import {useState} from "react";
import TitleContainer from "./components/TitleContainer.tsx";
import {VscDebugStart, VscDebugStop} from "react-icons/vsc";

function App() {

  const [countMs, setCountMs] = useState(60000)
  const [title, setTitle] = useState('Title')
  const [countdownSize, setcountdownSize] = useState(parseInt(localStorage.getItem('countdownSize') as string??"18"))
  const [titleSize, settitleSize] = useState(parseInt(localStorage.getItem('titleSize') as string??"18"))
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [countdownKey, setCountdownKey] = useState(Math.random())
  const [overtime, setOvertime] = useState(localStorage.getItem('overtime') === 'true')
  const [autoStart, setAutoStart] = useState(false)

  const resetCountdown =() => {
    setCountdownKey(Math.random())
    setCountMs(minutes * 60000 + seconds * 1000)
    setAutoStart(true)
  }
  const stopCountdown =() => {
    setCountdownKey(Math.random())
    setCountMs(0)
    setAutoStart(false)
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
  return (
      <>
        <div>
          <CountdownContainer ms={countMs} size={countdownSize} overtime={overtime} key={countdownKey} autoStart={autoStart}/>
        </div>
        <div>
          <TitleContainer initTitle={title} size={titleSize}/>
        </div>
        <div className="control">
          <input type='number' style={{width:'3em'}} value={minutes} size={2} min={0}  onInput={(e:React.ChangeEvent<HTMLInputElement>) => setMinutes(parseInt(e.target.value)??0)}/>
          <input type='number' style={{width:'3em'}} value={seconds} size={2} min={0} max={59} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setSeconds(parseInt(e.target.value)??0)}/>
          <button onClick={resetCountdown}><VscDebugStart /></button>
          <button onClick={stopCountdown}><VscDebugStop /></button>
          <input type='checkbox' checked={overtime} onChange={updateCheckbox}/>overtime
          <input type='text' value={title} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}/>
          count size:<input type='number' style={{width:'3em'}} value={countdownSize} min={1} onInput={updateCountSize}/>
          title size:<input type='number' style={{width:'3em'}} value={titleSize} min={1} onInput={updateTitleSize}/>
        </div>
      </>
  )
}

export default App
