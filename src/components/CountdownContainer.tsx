import Countdown, {zeroPad} from "react-countdown";
import {useEffect, useState} from "react";
import {CountdownRendererFn} from "react-countdown/dist/Countdown";

interface CountdownProps {
  ms: number,
  size?: number,
  overtime?: boolean
  autoStart?: boolean
}

function CountdownContainer({ms, size, overtime, autoStart=false}: Readonly<CountdownProps>) {
  const adjustMs = 1000;
  const [date, setDate] = useState(Date.now() + ms + adjustMs);
  useEffect(() => {
    if (ms > 0)
      setDate(Date.now() + ms + adjustMs);
  }, [ms]);
  const renderer: CountdownRendererFn = ({minutes, seconds, completed}) => {
    if (completed && !(minutes === 0 && seconds === 0)) {
      return <span style={{color: 'red'}}>-{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
    } else {
      return <span>{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
    }
  };

  return <div style={{fontSize: `${size}em`, fontFamily: 'Roboto, sans-serif', fontWeight: 500}}>
    <Countdown date={date} renderer={renderer} precision={100} intervalDelay={10} overtime={overtime} autoStart={autoStart}/>
  </div>;
}

export default CountdownContainer;