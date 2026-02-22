import update from 'immutability-helper'
import {FC, useCallback, useContext} from 'react'

import {QueueItem} from './QueueItem.tsx'
import {generalContext, QueueItemType} from "../GeneralContext.tsx";

export interface Item {
  id: number
  text: string
}

export interface ContainerState {
  cards: Item[]
}

export const Container: FC = () => {
  {
    const {queue, setQueue} = useContext(generalContext);

    const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
      setQueue((prevCards: QueueItemType[]) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        }),
      )
    }, [])

    const renderCard = useCallback(
      (card: QueueItemType, index: number) => {
        return (
          <QueueItem
            key={card.id}
            card={card}
            index={index}
            moveCard={moveCard}
          />
        )
      },
      [],
    )

    return (
      <>
        {queue.map((card, i) => renderCard(card, i))}
      </>
    )
  }
}
