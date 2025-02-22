import {VscDebugStart, VscDebugStop} from "react-icons/vsc";
import {MdOutlineExpandLess, MdOutlineExpandMore} from "react-icons/md";
import {useContext} from "react";
import {generalContext} from "../GeneralContext.tsx";
import QueueDialog from "./QueueDialog.tsx";

function ControllerContainer() {
  const {
    minutes,
    setMinutes,
    seconds,
    setSeconds,
    title,
    setTitle,
    setnextQueueIndex,
    nextQueueIndex,
    queue,
    setQueueDialog,
    queueDialog,
    showMinusTime,
    setShowMinusTime,
    setcountdownSize,
    countdownSize,
    settitleSize,
    titleSize,
    setCountMs
  } = useContext(generalContext);


  const startManualCountdown = () => {
    setCountMs(minutes * 60000 + seconds * 1000)
  }
  const stopCountdown = () => {
    setCountMs(0)
  }
  const updateCheckbox =
    (e: { target: { checked: boolean; }; }) => {
      setShowMinusTime(e.target.checked)
    }
  const updateCountSize =
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setcountdownSize(parseInt(e.target.value) ?? 0)
    }
  const updateTitleSize =
    (e: React.ChangeEvent<HTMLInputElement>) => {
      settitleSize(parseInt(e.target.value) ?? 0)
    }

  return (
    <div>
      <div className="control">
        <input type='number' value={minutes} size={2} min={0}
               onInput={(e: React.ChangeEvent<HTMLInputElement>) => setMinutes(parseInt(e.target.value) ?? 0)}/>
        <input type='number' value={seconds} size={2} min={0} max={59}
               onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSeconds(parseInt(e.target.value) ?? 0)}/>
        <button style={{width: '60px', marginRight: '6px'}} onClick={startManualCountdown}><VscDebugStart/></button>
        <button onClick={stopCountdown}><VscDebugStop/></button>
        <input type='checkbox' checked={showMinusTime} onChange={updateCheckbox}/>overtime
        <input type='text' value={title}
               onInput={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}/>
        count size:<input type='number' value={countdownSize} min={1} onInput={updateCountSize}/>
        title size:<input type='number' value={titleSize} min={1} onInput={updateTitleSize}/>
        <button onClick={() => setQueueDialog(!queueDialog)}>Queue {queueDialog ? <MdOutlineExpandMore/> :
          <MdOutlineExpandLess/>}</button>
        <div>nextQueue:
          <input type='number' min='0' max={queue.length} value={nextQueueIndex}
                 onInput={(e: React.ChangeEvent<HTMLInputElement>) => setnextQueueIndex(parseInt(e.target.value) ?? 0)}/>
          <button onClick={() => {
            if (queue.length <= nextQueueIndex) return
            setCountMs(queue[nextQueueIndex].minutes * 60000 + queue[nextQueueIndex].seconds * 1000)
            setTitle(queue[nextQueueIndex].title)
            setnextQueueIndex(nextQueueIndex + 1)
          }} style={{marginRight: '6px', width: '80px'}}>next
          </button>
          {nextQueueIndex < queue.length ? queue[nextQueueIndex]?.title : 'finished'}
        </div>

      </div>
      {queueDialog &&
          <QueueDialog/>
      }
    </div>
  );
}

export default ControllerContainer;