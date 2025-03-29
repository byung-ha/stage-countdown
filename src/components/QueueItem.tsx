import type {Identifier, XYCoord} from 'dnd-core'
import {FC, useContext} from 'react'
import {useRef} from 'react'
import {useDrag, useDrop} from 'react-dnd'
import {MdDeleteForever} from "react-icons/md";
import {generalContext, QueueItemType} from "../GeneralContext.tsx";

export const ItemTypes = {
  CARD: 'card',
}

const style = {
  cursor: 'move',
}

export interface CardProps {
  card: QueueItemType
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
}

interface DragItem {
  index: number
  type: string
}

export const QueueItem: FC<CardProps> = ({card: {id, title, minutes, seconds}, index, moveCard}) => {
  const {queue, setQueue} = useContext(generalContext)
  const ref = useRef<HTMLTableRowElement>(null)
  const [{handlerId}, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{isDragging}, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return {id, index}
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <tr ref={ref} style={{...style, opacity}} data-handler-id={handlerId}>
      <td>
        {index + 1}
      </td>
      <td>
        <input type='text' value={title}
               onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                 queue[index].title = e.target.value
                 setQueue([...queue])
               }}/></td>
      <td>
        <input type='number' value={minutes} min={0} max={59}
               onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                 queue[index].minutes = parseInt(e.target.value) ?? 0
                 setQueue([...queue])
               }}/></td>
      <td>
        <input type='number' value={seconds} min={0} max={59}
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
  )
}
