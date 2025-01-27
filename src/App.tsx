import './App.css'
import CountdownContainer from "./components/CountdownContainer.tsx";
import {useState} from "react";
import TitleContainer from "./components/TitleContainer.tsx";

function App() {

  const [countMs, setCountMs] = useState(10000)
  const [title, setTitle] = useState('Title')
  const [countdownSize, setcountdownSize] = useState(26)
  const [titleSize, settitleSize] = useState(18)
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [countdownKey, setCountdownKey] = useState(Math.random())
  const [overtime, setOvertime] = useState(false)

  const resetCountdown =() => {
    setCountdownKey(Math.random())
    setCountMs(minutes * 60000 + seconds * 1000)
  }
  return (
      <>
        <div>
          <CountdownContainer ms={countMs} size={countdownSize} overtime={overtime} key={countdownKey}/>
        </div>
        <div>
          <TitleContainer initTitle={title} size={titleSize}/>
        </div>
        <hr style={{color:'grey'}}/>
        <div className="control">
          <input type='number' style={{width:'3em'}} value={minutes} size={2} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setMinutes(parseInt(e.target.value)??0)}/>
          <span>&nbsp;:&nbsp;</span>
          <input type='number' style={{width:'3em'}} value={seconds} size={2} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setSeconds(parseInt(e.target.value)??0)}/>
          <button onClick={resetCountdown}>Start</button>&nbsp;
          <input type='checkbox' checked={overtime} onChange={e => setOvertime(e.target.checked)}/>overtime&nbsp;
          <input type='text' value={title} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}/>&nbsp;
          count size:<input type='number' style={{width:'3em'}} value={countdownSize} min={5} onInput={(e:React.ChangeEvent<HTMLInputElement>) => setcountdownSize(parseInt(e.target.value)??0)}/>&nbsp;
          title size:<input type='number' style={{width:'3em'}} value={titleSize} min={5} onInput={(e:React.ChangeEvent<HTMLInputElement>) => settitleSize(parseInt(e.target.value)??0)}/>&nbsp;
        </div>
      </>
  )
}

export default App
