import {emptyElement, generalContext} from "../GeneralContext.tsx";
import {MdAdd, MdDeleteForever} from "react-icons/md";
import {useContext} from "react";

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
          <button onClick={() => setQueue([...queue, emptyElement])}>
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
          {queue.map((item, index) =>
            <tr key={index}>
              <td>
                {index + 1}
              </td>
              <td>
                <input type='text' value={item.title}
                       onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                         queue[index].title = e.target.value
                         setQueue([...queue])
                       }}/></td>
              <td>
                <input type='number' value={item.minutes}
                       onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                         queue[index].minutes = parseInt(e.target.value) ?? 0
                         setQueue([...queue])
                       }}/></td>
              <td>
                <input type='number' value={item.seconds}
                       onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                         queue[index].seconds = parseInt(e.target.value) ?? 0
                         setQueue([...queue])
                       }}/></td>
              <td>
                <button onClick={() => setQueue(queue.filter((_, i) => i !== index))}>
                  <MdDeleteForever/>
                </button>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QueueDialog;