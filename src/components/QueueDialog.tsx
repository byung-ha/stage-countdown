import {emptyElement, generalContext} from "../GeneralContext.tsx";
import {MdAdd} from "react-icons/md";
import {useContext} from "react";
import {Container} from "./Container.tsx";

function QueueDialog() {
  const {
    queue,
    setQueue,
    setEnableAutoStart,
    setAutoStartTime,
    enableAutoStart,
    autoStartTime
  } = useContext(generalContext);

  return (
    <div className="queueDialog">
      <div className="queue_content">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1em'}}>
          <h1>Queue</h1>
          <button onClick={() => setQueue([...queue, {...emptyElement}])}>
            <MdAdd/>
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
          <Container/>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QueueDialog;