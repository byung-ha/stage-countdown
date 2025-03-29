import Countdown, {zeroPad} from "react-countdown";
import {CountdownRendererFn} from "react-countdown/dist/Countdown";
import {useContext, useEffect, useState} from "react";
import {generalContext} from "../GeneralContext.tsx";


const adjustMs = 999;

function CountdownContainer() {
  const {countMs, countdownSize, showMinusTime} = useContext(generalContext)
  const [date, setDate] = useState(Date.now() + countMs + adjustMs)
  const [key, setKey] = useState(Math.random())
  const [enableAutoStart, setEnableAutoStart] = useState(false)
  useEffect(() => {
    setKey(Math.random())
    if (countMs !== 0) {
      setEnableAutoStart(true)
      setDate(Date.now() + countMs + adjustMs)
    } else {
      setEnableAutoStart(false)
      setDate(Date.now())
    }
  }, [countMs])
  const renderer: CountdownRendererFn = ({hours, minutes, seconds, completed}) => {
    if (completed && !(minutes === 0 && seconds === 0)) {
      return <span style={{color: 'red'}}>-{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
    } else {
      return <span>{hours > 0 && hours + ':'}{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
    }
  };

  return <div style={{fontSize: `${countdownSize}em`}}>
    <Countdown key={key} date={date} renderer={renderer} precision={100} intervalDelay={10} overtime={showMinusTime}
               autoStart={enableAutoStart}/>
  </div>;
}

export default CountdownContainer;