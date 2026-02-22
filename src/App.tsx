import { useEffect, useState } from 'react'
import './App.css'

const DEFAULT_MINUTES = 10
const DEFAULT_SECONDS = 0
const TICK_MS = 250
const DEFAULT_TITLE = 'title'
const DEFAULT_QUEUE_ITEM_TITLE = 'Queue Item'
const DEFAULT_TIMER_ITEM_TITLE = 'CB1'
const MAX_TITLE_LENGTH = 40
const SETTINGS_STORAGE_KEY = 'stage-countdown.settings.v1'
const QUEUE_STORAGE_KEY = 'stage-countdown.queue.v1'
const TIMER_STORAGE_KEY = 'stage-countdown.timer.v1'
const FONT_OPTIONS = [
  { value: 'system', label: 'System Sans', family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  { value: 'roboto', label: 'Roboto', family: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  { value: 'serif', label: 'Classic Serif', family: "Georgia, 'Times New Roman', Times, serif" },
  { value: 'mono', label: 'Monospace', family: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace" },
  { value: 'condensed', label: 'Condensed', family: "'Arial Narrow', 'Roboto Condensed', Arial, sans-serif" },
] as const
const ALIGN_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
] as const
const CONTROL_ALIGN_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
] as const

type FontOptionValue = (typeof FONT_OPTIONS)[number]['value']
type AlignOptionValue = (typeof ALIGN_OPTIONS)[number]['value']
type ControlAlignOptionValue = (typeof CONTROL_ALIGN_OPTIONS)[number]['value']
type QueueItem = {
  id: string
  minutes: number
  seconds: number
  title: string
}
type TimerItem = {
  hours: number
  id: string
  minutes: number
  title: string
}

type PersistedSettings = {
  allowNegativeTime: boolean
  contentGap: number
  contentMarginBottom: number
  contentMarginLeft: number
  contentMarginRight: number
  contentMarginTop: number
  configuredMinutes: number
  configuredSeconds: number
  contentAlign: AlignOptionValue
  controlsAlign: ControlAlignOptionValue
  font: FontOptionValue
  timeFontSize: number
  titleFontSize: number
  titleText: string
}

const DEFAULT_SETTINGS: PersistedSettings = {
  allowNegativeTime: true,
  contentGap: 16,
  contentMarginBottom: 0,
  contentMarginLeft: 0,
  contentMarginRight: 0,
  contentMarginTop: 0,
  configuredMinutes: DEFAULT_MINUTES,
  configuredSeconds: DEFAULT_SECONDS,
  contentAlign: 'center',
  controlsAlign: 'top',
  font: 'system',
  timeFontSize: 180,
  titleFontSize: 80,
  titleText: DEFAULT_TITLE,
}

const DEFAULT_QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'queue-item-1',
    minutes: 10,
    seconds: 0,
    title: 'Preroll',
  },
  {
    id: 'queue-item-2',
    minutes: 4,
    seconds: 40,
    title: 'Psalm 23',
  },
  {
    id: 'queue-item-3',
    minutes: 5,
    seconds: 0,
    title: 'Wer sonst',
  },
  {
    id: 'queue-item-4',
    minutes: 3,
    seconds: 0,
    title: 'Moderation',
  },
  {
    id: 'queue-item-5',
    minutes: 4,
    seconds: 0,
    title: 'MdG',
  },
  {
    id: 'queue-item-6',
    minutes: 2,
    seconds: 0,
    title: 'Wer sonst',
  },
  {
    id: 'queue-item-7',
    minutes: 35,
    seconds: 0,
    title: 'Stream',
  },
  {
    id: 'queue-item-8',
    minutes: 5,
    seconds: 1,
    title: 'New Heights',
  },
  {
    id: 'queue-item-9',
    minutes: 3,
    seconds: 0,
    title: 'Abmod',
  },
  {
    id: 'queue-item-10',
    minutes: 3,
    seconds: 29,
    title: 'Treuer Gott',
  },
]

const DEFAULT_TIMER_ITEMS: TimerItem[] = [
  {
    hours: 10,
    id: 'timer-item-1',
    minutes: 0,
    title: 'CB1',
  },
  {
    hours: 12,
    id: 'timer-item-2',
    minutes: 0,
    title: 'CB2',
  },
]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function parseInputNumber(value: string): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

function isFormElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    tagName === 'BUTTON' ||
    target.isContentEditable
  )
}

function formatCountdown(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '-' : ''
  const absoluteSeconds = Math.abs(totalSeconds)
  const hours = Math.floor(absoluteSeconds / 3600)
  const minutes = Math.floor((absoluteSeconds % 3600) / 60)
  const seconds = absoluteSeconds % 60

  if (absoluteSeconds >= 3600) {
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${sign}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function isFontOptionValue(value: unknown): value is FontOptionValue {
  return typeof value === 'string' && FONT_OPTIONS.some((option) => option.value === value)
}

function isAlignOptionValue(value: unknown): value is AlignOptionValue {
  return typeof value === 'string' && ALIGN_OPTIONS.some((option) => option.value === value)
}

function isControlAlignOptionValue(value: unknown): value is ControlAlignOptionValue {
  return typeof value === 'string' && CONTROL_ALIGN_OPTIONS.some((option) => option.value === value)
}

function readStoredSettings(): PersistedSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!rawSettings) {
      return DEFAULT_SETTINGS
    }

    const parsedJson: unknown = JSON.parse(rawSettings)
    if (!parsedJson || typeof parsedJson !== 'object') {
      return DEFAULT_SETTINGS
    }
    const parsed = parsedJson as Partial<PersistedSettings>

    return {
      allowNegativeTime:
        typeof parsed.allowNegativeTime === 'boolean' ? parsed.allowNegativeTime : DEFAULT_SETTINGS.allowNegativeTime,
      contentGap: typeof parsed.contentGap === 'number' ? clamp(parsed.contentGap, 0, 300) : DEFAULT_SETTINGS.contentGap,
      contentMarginBottom:
        typeof parsed.contentMarginBottom === 'number'
          ? clamp(parsed.contentMarginBottom, 0, 500)
          : DEFAULT_SETTINGS.contentMarginBottom,
      contentMarginLeft:
        typeof parsed.contentMarginLeft === 'number'
          ? clamp(parsed.contentMarginLeft, 0, 500)
          : DEFAULT_SETTINGS.contentMarginLeft,
      contentMarginRight:
        typeof parsed.contentMarginRight === 'number'
          ? clamp(parsed.contentMarginRight, 0, 500)
          : DEFAULT_SETTINGS.contentMarginRight,
      contentMarginTop:
        typeof parsed.contentMarginTop === 'number'
          ? clamp(parsed.contentMarginTop, 0, 500)
          : DEFAULT_SETTINGS.contentMarginTop,
      configuredMinutes:
        typeof parsed.configuredMinutes === 'number'
          ? clamp(parsed.configuredMinutes, 0, 999)
          : DEFAULT_SETTINGS.configuredMinutes,
      configuredSeconds:
        typeof parsed.configuredSeconds === 'number'
          ? clamp(parsed.configuredSeconds, 0, 59)
          : DEFAULT_SETTINGS.configuredSeconds,
      contentAlign: isAlignOptionValue(parsed.contentAlign) ? parsed.contentAlign : DEFAULT_SETTINGS.contentAlign,
      controlsAlign: isControlAlignOptionValue(parsed.controlsAlign)
        ? parsed.controlsAlign
        : DEFAULT_SETTINGS.controlsAlign,
      font: isFontOptionValue(parsed.font) ? parsed.font : DEFAULT_SETTINGS.font,
      timeFontSize:
        typeof parsed.timeFontSize === 'number' ? clamp(parsed.timeFontSize, 72, 320) : DEFAULT_SETTINGS.timeFontSize,
      titleFontSize:
        typeof parsed.titleFontSize === 'number'
          ? clamp(parsed.titleFontSize, 72, 320)
          : DEFAULT_SETTINGS.titleFontSize,
      titleText:
        typeof parsed.titleText === 'string'
          ? parsed.titleText.slice(0, MAX_TITLE_LENGTH)
          : DEFAULT_SETTINGS.titleText,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function normalizeQueueItem(item: unknown, fallbackId: string): QueueItem {
  if (!item || typeof item !== 'object') {
    return {
      id: fallbackId,
      minutes: DEFAULT_MINUTES,
      seconds: DEFAULT_SECONDS,
      title: DEFAULT_QUEUE_ITEM_TITLE,
    }
  }

  const candidate = item as Partial<QueueItem>
  return {
    id: typeof candidate.id === 'string' && candidate.id.length > 0 ? candidate.id : fallbackId,
    minutes: typeof candidate.minutes === 'number' ? clamp(candidate.minutes, 0, 999) : DEFAULT_MINUTES,
    seconds: typeof candidate.seconds === 'number' ? clamp(candidate.seconds, 0, 59) : DEFAULT_SECONDS,
    title:
      typeof candidate.title === 'string' && candidate.title.length > 0
        ? candidate.title.slice(0, MAX_TITLE_LENGTH)
        : DEFAULT_QUEUE_ITEM_TITLE,
  }
}

function readStoredQueueItems(): QueueItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_QUEUE_ITEMS
  }

  try {
    const rawQueue = window.localStorage.getItem(QUEUE_STORAGE_KEY)
    if (!rawQueue) {
      return DEFAULT_QUEUE_ITEMS
    }

    const parsedJson: unknown = JSON.parse(rawQueue)
    if (!Array.isArray(parsedJson)) {
      return DEFAULT_QUEUE_ITEMS
    }

    const normalized = parsedJson.map((item, index) => normalizeQueueItem(item, `queue-item-${index + 1}`))
    return normalized.length > 0 ? normalized : DEFAULT_QUEUE_ITEMS
  } catch {
    return DEFAULT_QUEUE_ITEMS
  }
}

function normalizeTimerItem(item: unknown, fallbackId: string): TimerItem {
  if (!item || typeof item !== 'object') {
    return {
      hours: 10,
      id: fallbackId,
      minutes: 0,
      title: DEFAULT_TIMER_ITEM_TITLE,
    }
  }

  const candidate = item as Partial<TimerItem>
  return {
    hours: typeof candidate.hours === 'number' ? clamp(candidate.hours, 0, 23) : 0,
    id: typeof candidate.id === 'string' && candidate.id.length > 0 ? candidate.id : fallbackId,
    minutes: typeof candidate.minutes === 'number' ? clamp(candidate.minutes, 0, 59) : 0,
    title:
      typeof candidate.title === 'string' && candidate.title.length > 0
        ? candidate.title.slice(0, MAX_TITLE_LENGTH)
        : DEFAULT_TIMER_ITEM_TITLE,
  }
}

function readStoredTimerItems(): TimerItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_TIMER_ITEMS
  }

  try {
    const rawTimerItems = window.localStorage.getItem(TIMER_STORAGE_KEY)
    if (!rawTimerItems) {
      return DEFAULT_TIMER_ITEMS
    }

    const parsedJson: unknown = JSON.parse(rawTimerItems)
    if (!Array.isArray(parsedJson)) {
      return DEFAULT_TIMER_ITEMS
    }

    const normalized = parsedJson.map((item, index) => normalizeTimerItem(item, `timer-item-${index + 1}`))
    return normalized
  } catch {
    return DEFAULT_TIMER_ITEMS
  }
}

function createQueueItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `queue-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function ResumeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.5" y="3" width="4.5" height="18" rx="2.2" fill="currentColor" />
      <path d="M9.5 3.5L21 12L9.5 20.5V3.5Z" fill="currentColor" />
    </svg>
  )
}

function App() {
  const [storedSettings] = useState<PersistedSettings>(() => readStoredSettings())
  const [storedQueueItems] = useState<QueueItem[]>(() => readStoredQueueItems())
  const [storedTimerItems] = useState<TimerItem[]>(() => readStoredTimerItems())
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const [elapsedBeforeStartMs, setElapsedBeforeStartMs] = useState<number>(0)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const [configuredMinutes, setConfiguredMinutes] = useState<number>(storedSettings.configuredMinutes)
  const [configuredSeconds, setConfiguredSeconds] = useState<number>(storedSettings.configuredSeconds)
  const [contentGap, setContentGap] = useState<number>(storedSettings.contentGap)
  const [contentMarginTop, setContentMarginTop] = useState<number>(storedSettings.contentMarginTop)
  const [contentMarginBottom, setContentMarginBottom] = useState<number>(storedSettings.contentMarginBottom)
  const [contentMarginLeft, setContentMarginLeft] = useState<number>(storedSettings.contentMarginLeft)
  const [contentMarginRight, setContentMarginRight] = useState<number>(storedSettings.contentMarginRight)
  const [durationSeconds, setDurationSeconds] = useState<number>(
    storedSettings.configuredMinutes * 60 + storedSettings.configuredSeconds,
  )
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false)
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState<boolean>(false)
  const [isTimerPanelOpen, setIsTimerPanelOpen] = useState<boolean>(false)
  const [queueItems, setQueueItems] = useState<QueueItem[]>(storedQueueItems)
  const [timerItems, setTimerItems] = useState<TimerItem[]>(storedTimerItems)
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1)
  const [nextQueueIndexInput, setNextQueueIndexInput] = useState<number>(1)
  const [timeFontSize, setTimeFontSize] = useState<number>(storedSettings.timeFontSize)
  const [titleFontSize, setTitleFontSize] = useState<number>(storedSettings.titleFontSize)
  const [titleText, setTitleText] = useState<string>(storedSettings.titleText)
  const [font, setFont] = useState<FontOptionValue>(storedSettings.font)
  const [contentAlign, setContentAlign] = useState<AlignOptionValue>(storedSettings.contentAlign)
  const [controlsAlign, setControlsAlign] = useState<ControlAlignOptionValue>(storedSettings.controlsAlign)
  const [allowNegativeTime, setAllowNegativeTime] = useState<boolean>(storedSettings.allowNegativeTime)
  const [autoStartQueueOnTimerEnd, setAutoStartQueueOnTimerEnd] = useState<boolean>(false)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, TICK_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isRunning])

  const elapsedWhileRunningMs = isRunning && startedAtMs !== null ? nowMs - startedAtMs : 0
  const elapsedSeconds = Math.floor((elapsedBeforeStartMs + elapsedWhileRunningMs) / 1000)
  const remainingSeconds = durationSeconds - elapsedSeconds
  const shownRemainingSeconds = allowNegativeTime ? remainingSeconds : Math.max(remainingSeconds, 0)
  const isPaused = !isRunning && elapsedBeforeStartMs > 0 && durationSeconds > 0

  useEffect(() => {
    if (autoStartQueueOnTimerEnd || allowNegativeTime || !isRunning || remainingSeconds > 0) {
      return
    }

    setIsRunning(false)
    setStartedAtMs(null)
    setElapsedBeforeStartMs(durationSeconds * 1000)
    setNowMs(Date.now())
  }, [autoStartQueueOnTimerEnd, allowNegativeTime, isRunning, remainingSeconds, durationSeconds])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const nextSettings: PersistedSettings = {
      allowNegativeTime,
      contentGap,
      contentMarginBottom,
      contentMarginLeft,
      contentMarginRight,
      contentMarginTop,
      configuredMinutes,
      configuredSeconds,
      contentAlign,
      controlsAlign,
      font,
      timeFontSize,
      titleFontSize,
      titleText: titleText.slice(0, MAX_TITLE_LENGTH),
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings))
  }, [
    allowNegativeTime,
    contentGap,
    contentMarginBottom,
    contentMarginLeft,
    contentMarginRight,
    contentMarginTop,
    configuredMinutes,
    configuredSeconds,
    contentAlign,
    controlsAlign,
    font,
    timeFontSize,
    titleFontSize,
    titleText,
  ])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueItems))
  }, [queueItems])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerItems))
  }, [timerItems])

  useEffect(() => {
    setCurrentQueueIndex(-1)
    setTitleText(DEFAULT_TITLE)
    setDurationSeconds(0)
    setAutoStartQueueOnTimerEnd(false)
    setIsRunning(false)
    setStartedAtMs(null)
    setElapsedBeforeStartMs(0)
    setNowMs(Date.now())
  }, [])

  useEffect(() => {
    if (queueItems.length === 0) {
      setCurrentQueueIndex(-1)
      setNextQueueIndexInput(1)
      return
    }

    setCurrentQueueIndex((previousIndex) => {
      if (previousIndex < -1) {
        return -1
      }

      if (previousIndex > queueItems.length - 1) {
        return queueItems.length - 1
      }

      return previousIndex
    })
    setNextQueueIndexInput((previousValue) => clamp(previousValue, 1, queueItems.length))
  }, [queueItems])

  const handleStart = () => {
    const minutes = clamp(configuredMinutes, 0, 999)
    const seconds = clamp(configuredSeconds, 0, 59)
    const totalSeconds = minutes * 60 + seconds

    setConfiguredMinutes(minutes)
    setConfiguredSeconds(seconds)
    setDurationSeconds(totalSeconds)
    setAutoStartQueueOnTimerEnd(false)
    setElapsedBeforeStartMs(0)
    setStartedAtMs(Date.now())
    setNowMs(Date.now())
    setIsRunning(true)
  }

  const handlePause = () => {
    if (!isRunning || startedAtMs === null) {
      return
    }

    setElapsedBeforeStartMs((previousElapsedMs) => previousElapsedMs + (Date.now() - startedAtMs))
    setStartedAtMs(null)
    setIsRunning(false)
  }

  const handleResume = () => {
    if (!isPaused) {
      return
    }

    setStartedAtMs(Date.now())
    setNowMs(Date.now())
    setIsRunning(true)
  }

  const handlePauseResume = () => {
    if (isRunning) {
      handlePause()
      return
    }

    handleResume()
  }

  const handleStop = () => {
    setAutoStartQueueOnTimerEnd(false)
    setIsRunning(false)
    setStartedAtMs(null)
    setElapsedBeforeStartMs(0)
    setDurationSeconds(0)
    setNowMs(Date.now())
  }

  const loadQueueItemByIndex = (index: number, shouldStart: boolean) => {
    const item = queueItems[index]
    if (!item) {
      return
    }

    setCurrentQueueIndex(index)
    setAutoStartQueueOnTimerEnd(false)
    setTitleText(item.title.slice(0, MAX_TITLE_LENGTH))
    setConfiguredMinutes(item.minutes)
    setConfiguredSeconds(item.seconds)
    setDurationSeconds(item.minutes * 60 + item.seconds)
    const now = Date.now()
    if (shouldStart) {
      setIsRunning(true)
      setStartedAtMs(now)
      setElapsedBeforeStartMs(0)
      setNowMs(now)
      return
    }

    setIsRunning(false)
    setStartedAtMs(null)
    setElapsedBeforeStartMs(0)
    setNowMs(now)
  }

  useEffect(() => {
    if (!autoStartQueueOnTimerEnd || !isRunning || remainingSeconds > 0) {
      return
    }

    if (queueItems.length === 0) {
      setAutoStartQueueOnTimerEnd(false)
      return
    }

    const firstQueueItem = queueItems[0]
    const now = Date.now()

    setAutoStartQueueOnTimerEnd(false)
    setCurrentQueueIndex(0)
    setNextQueueIndexInput(queueItems.length > 1 ? 2 : 1)
    setTitleText(firstQueueItem.title.slice(0, MAX_TITLE_LENGTH))
    setConfiguredMinutes(firstQueueItem.minutes)
    setConfiguredSeconds(firstQueueItem.seconds)
    setDurationSeconds(firstQueueItem.minutes * 60 + firstQueueItem.seconds)
    setIsRunning(true)
    setStartedAtMs(now)
    setElapsedBeforeStartMs(0)
    setNowMs(now)
  }, [autoStartQueueOnTimerEnd, isRunning, remainingSeconds, queueItems])

  const handleNextQueueItem = () => {
    if (queueItems.length === 0) {
      return
    }

    const targetIndex = clamp(nextQueueIndexInput, 1, queueItems.length) - 1
    loadQueueItemByIndex(targetIndex, true)
    setNextQueueIndexInput(((targetIndex + 1) % queueItems.length) + 1)
  }

  const handlePreviousQueueItem = () => {
    if (queueItems.length === 0) {
      return
    }

    const previousIndex = currentQueueIndex <= 0 ? queueItems.length - 1 : currentQueueIndex - 1
    loadQueueItemByIndex(previousIndex, true)
    setNextQueueIndexInput(((previousIndex + 1) % queueItems.length) + 1)
  }

  const normalizedNextQueueIndex = queueItems.length > 0 ? clamp(nextQueueIndexInput, 1, queueItems.length) : 1
  const nextQueueItemTitle =
    queueItems.length > 0 ? queueItems[normalizedNextQueueIndex - 1]?.title ?? '-' : '-'

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || isFormElement(event.target)) {
        return
      }

      event.preventDefault()
      handleNextQueueItem()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleNextQueueItem])

  const handleAddQueueItem = () => {
    setQueueItems((previousQueueItems) => [
      ...previousQueueItems,
      {
        id: createQueueItemId(),
        minutes: DEFAULT_MINUTES,
        seconds: DEFAULT_SECONDS,
        title: DEFAULT_QUEUE_ITEM_TITLE,
      },
    ])
  }

  const handleDeleteQueueItem = (id: string) => {
    setQueueItems((previousQueueItems) => {
      const nextQueueItems = previousQueueItems.filter((item) => item.id !== id)
      return nextQueueItems.length > 0 ? nextQueueItems : previousQueueItems
    })
  }

  const handleQueueItemChange = (id: string, changes: Partial<QueueItem>) => {
    setQueueItems((previousQueueItems) =>
      previousQueueItems.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          ...changes,
        }
      }),
    )
  }

  const handleMoveQueueItem = (fromIndex: number, toIndex: number) => {
    setQueueItems((previousQueueItems) => {
      if (toIndex < 0 || toIndex >= previousQueueItems.length) {
        return previousQueueItems
      }

      const nextQueueItems = [...previousQueueItems]
      const [movedItem] = nextQueueItems.splice(fromIndex, 1)
      nextQueueItems.splice(toIndex, 0, movedItem)
      return nextQueueItems
    })
  }

  const handleAddTimerItem = () => {
    setTimerItems((previousTimerItems) => [
      ...previousTimerItems,
      {
        hours: 0,
        id: createQueueItemId(),
        minutes: DEFAULT_MINUTES,
        title: DEFAULT_TITLE,
      },
    ])
  }

  const handleDeleteTimerItem = (id: string) => {
    setTimerItems((previousTimerItems) => previousTimerItems.filter((item) => item.id !== id))
  }

  const handleTimerItemChange = (id: string, changes: Partial<TimerItem>) => {
    setTimerItems((previousTimerItems) =>
      previousTimerItems.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          ...changes,
        }
      }),
    )
  }

  const handleStartTimerItem = (item: TimerItem) => {
    const hours = clamp(item.hours, 0, 23)
    const minutes = clamp(item.minutes, 0, 59)
    const now = new Date()
    const target = new Date(now)
    target.setHours(hours, minutes, 0, 0)

    // If the target clock time has already passed today, use next day.
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1)
    }

    const diffSeconds = Math.ceil((target.getTime() - now.getTime()) / 1000)
    const nowMsValue = now.getTime()

    setTitleText(item.title.slice(0, MAX_TITLE_LENGTH))
    setConfiguredMinutes(Math.floor(diffSeconds / 60))
    setConfiguredSeconds(diffSeconds % 60)
    setDurationSeconds(diffSeconds)
    setAutoStartQueueOnTimerEnd(true)
    setIsRunning(true)
    setIsTimerPanelOpen(false)
    setStartedAtMs(nowMsValue)
    setElapsedBeforeStartMs(0)
    setNowMs(nowMsValue)
  }

  const handleQueuePanelToggle = () => {
    if (isQueuePanelOpen) {
      setIsQueuePanelOpen(false)
      return
    }

    setIsQueuePanelOpen(true)
    setIsTimerPanelOpen(false)
    setIsConfigOpen(false)
  }

  const handleTimerPanelToggle = () => {
    if (isTimerPanelOpen) {
      setIsTimerPanelOpen(false)
      return
    }

    setIsTimerPanelOpen(true)
    setIsQueuePanelOpen(false)
    setIsConfigOpen(false)
  }

  const handleConfigPanelToggle = () => {
    if (isConfigOpen) {
      setIsConfigOpen(false)
      return
    }

    setIsConfigOpen(true)
    setIsQueuePanelOpen(false)
    setIsTimerPanelOpen(false)
  }

  const selectedFont = FONT_OPTIONS.find((option) => option.value === font) ?? FONT_OPTIONS[0]

  return (
    <div className="app-shell">
      <aside className={`queue-panel ${isQueuePanelOpen ? 'queue-panel--open' : 'queue-panel--closed'}`}>
        <button
          className="queue-toggle"
          onClick={handleQueuePanelToggle}
          type="button"
          aria-expanded={isQueuePanelOpen}
          aria-controls="queue-panel-content"
          aria-label={isQueuePanelOpen ? 'Collapse queue panel' : 'Open queue panel'}
          title={isQueuePanelOpen ? 'Collapse queue panel' : 'Open queue panel'}
        >
          {isQueuePanelOpen ? '✕' : '≡'}
        </button>
        <div className="queue-content" id="queue-panel-content" aria-hidden={!isQueuePanelOpen}>
          <div className="queue-header">
            <h2 className="config-title">Queues</h2>
            <button className="queue-add-button" onClick={handleAddQueueItem} type="button" title="Add queue row">
              ＋
            </button>
          </div>
          <div className="queue-table" role="table" aria-label="Queue Items">
            <div className="queue-table-row queue-table-row--head" role="row">
              <div className="queue-cell queue-cell--title" role="columnheader">
                Title
              </div>
              <div className="queue-cell queue-cell--time" role="columnheader">
                Min
              </div>
              <div className="queue-cell queue-cell--time" role="columnheader">
                Sec
              </div>
              <div className="queue-cell queue-cell--actions" role="columnheader">
                Actions
              </div>
            </div>
            {queueItems.map((item, index) => (
              <div className="queue-table-row" key={item.id} role="row">
                <div className="queue-cell queue-cell--title" role="cell">
                  <span className="queue-item-index" aria-hidden="true">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    maxLength={MAX_TITLE_LENGTH}
                    aria-label={`Queue item ${index + 1} title`}
                    onChange={(event) => handleQueueItemChange(item.id, { title: event.target.value })}
                  />
                </div>
                <div className="queue-cell queue-cell--time" role="cell">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={item.minutes}
                    aria-label={`Queue item ${index + 1} minutes`}
                    onChange={(event) =>
                      handleQueueItemChange(item.id, { minutes: clamp(parseInputNumber(event.target.value), 0, 999) })
                    }
                  />
                </div>
                <div className="queue-cell queue-cell--time" role="cell">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={item.seconds}
                    aria-label={`Queue item ${index + 1} seconds`}
                    onChange={(event) =>
                      handleQueueItemChange(item.id, { seconds: clamp(parseInputNumber(event.target.value), 0, 59) })
                    }
                  />
                </div>
                <div className="queue-cell queue-cell--actions" role="cell">
                  <div className="queue-actions">
                    <button
                      className="queue-action-button"
                      onClick={() => handleMoveQueueItem(index, index - 1)}
                      type="button"
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="queue-action-button"
                      onClick={() => handleMoveQueueItem(index, index + 1)}
                      type="button"
                      disabled={index === queueItems.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="queue-action-button queue-action-button--danger"
                      onClick={() => handleDeleteQueueItem(item.id)}
                      type="button"
                      disabled={queueItems.length <= 1}
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <aside className={`timer-panel ${isTimerPanelOpen ? 'timer-panel--open' : 'timer-panel--closed'}`}>
        <button
          className="timer-toggle"
          onClick={handleTimerPanelToggle}
          type="button"
          aria-expanded={isTimerPanelOpen}
          aria-controls="timer-panel-content"
          aria-label={isTimerPanelOpen ? 'Collapse timer panel' : 'Open timer panel'}
          title={isTimerPanelOpen ? 'Collapse timer panel' : 'Open timer panel'}
        >
          {isTimerPanelOpen ? '✕' : '⏱'}
        </button>
        <div className="timer-content" id="timer-panel-content" aria-hidden={!isTimerPanelOpen}>
          <div className="timer-header">
            <h2 className="config-title">Timer</h2>
            <button className="timer-add-button" onClick={handleAddTimerItem} type="button" title="Add timer row">
              ＋
            </button>
          </div>
          <div className="timer-table" role="table" aria-label="Timer Items">
            <div className="timer-table-row timer-table-row--head" role="row">
              <div className="timer-cell timer-cell--title" role="columnheader">
                Title
              </div>
              <div className="timer-cell timer-cell--time" role="columnheader">
                Hour
              </div>
              <div className="timer-cell timer-cell--time" role="columnheader">
                Min
              </div>
              <div className="timer-cell timer-cell--actions" role="columnheader">
                Actions
              </div>
            </div>
            {timerItems.map((item, index) => (
              <div className="timer-table-row" key={item.id} role="row">
                <div className="timer-cell timer-cell--title" role="cell">
                  <span className="queue-item-index" aria-hidden="true">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    maxLength={MAX_TITLE_LENGTH}
                    aria-label={`Timer item ${index + 1} title`}
                    onChange={(event) => handleTimerItemChange(item.id, { title: event.target.value })}
                  />
                </div>
                <div className="timer-cell timer-cell--time" role="cell">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={item.hours}
                    aria-label={`Timer item ${index + 1} hours`}
                    onChange={(event) =>
                      handleTimerItemChange(item.id, { hours: clamp(parseInputNumber(event.target.value), 0, 23) })
                    }
                  />
                </div>
                <div className="timer-cell timer-cell--time" role="cell">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={item.minutes}
                    aria-label={`Timer item ${index + 1} minutes`}
                    onChange={(event) =>
                      handleTimerItemChange(item.id, { minutes: clamp(parseInputNumber(event.target.value), 0, 59) })
                    }
                  />
                </div>
                <div className="timer-cell timer-cell--actions" role="cell">
                  <div className="timer-actions">
                    <button
                      className="timer-action-button"
                      onClick={() => handleStartTimerItem(item)}
                      type="button"
                      title="Start timer"
                    >
                      Start
                    </button>
                    <button
                      className="timer-action-button timer-action-button--danger"
                      onClick={() => handleDeleteTimerItem(item.id)}
                      type="button"
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <div className={`controls-panel controls-panel--${controlsAlign}`}>
        <label className="title-input-group">
          <span className="time-input-label">Title</span>
          <input
            className="title-input"
            type="text"
            value={titleText}
            onChange={(event) => setTitleText(event.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder="Enter title"
          />
        </label>
        <div className="time-inputs">
          <label className="time-input-group">
            <span className="time-input-label">Min</span>
            <input
              className="time-input"
              type="number"
              min="0"
              max="999"
              value={configuredMinutes}
              onChange={(event) => setConfiguredMinutes(clamp(parseInputNumber(event.target.value), 0, 999))}
            />
          </label>
          <label className="time-input-group">
            <span className="time-input-label">Sec</span>
            <input
              className="time-input"
              type="number"
              min="0"
              max="59"
              value={configuredSeconds}
              onChange={(event) => setConfiguredSeconds(clamp(parseInputNumber(event.target.value), 0, 59))}
            />
          </label>
        </div>
        <div className="controls">
          <button
            className="control-button"
            onClick={handleStart}
            type="button"
            aria-label="Start timer"
            title="Start timer"
          >
            ▶
          </button>
          <button
            className="control-button"
            onClick={handlePauseResume}
            type="button"
            aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
            title={isRunning ? 'Pause timer' : 'Resume timer'}
            disabled={!isRunning && !isPaused}
          >
            {isRunning ? '⏸' : <ResumeIcon />}
          </button>
          <button
            className="control-button"
            onClick={handleStop}
            type="button"
            aria-label="Stop timer"
            title="Stop timer"
          >
            ⏹
          </button>
          <button
            className="control-button"
            onClick={handlePreviousQueueItem}
            type="button"
            aria-label="Load previous queue item"
            title="Load previous queue item"
            disabled={queueItems.length === 0}
          >
            ⏮
          </button>
          <button
            className="control-button control-button--next"
            onClick={handleNextQueueItem}
            type="button"
            aria-label="Load next queue item"
            title="Load next queue item"
            disabled={queueItems.length === 0}
          >
            ⏭
          </button>
        </div>
        <div className="next-item-indicator" aria-live="polite">
          <label className="next-item-label" htmlFor="next-item-input">
            Next #
          </label>
          <input
            id="next-item-input"
            className="next-item-input"
            type="number"
            min="1"
            max={Math.max(queueItems.length, 1)}
            value={normalizedNextQueueIndex}
            onChange={(event) => setNextQueueIndexInput(clamp(parseInputNumber(event.target.value), 1, queueItems.length))}
            disabled={queueItems.length === 0}
          />
          <div className="next-item-title">{nextQueueItemTitle}</div>
        </div>
      </div>
      <aside className={`config-panel ${isConfigOpen ? 'config-panel--open' : 'config-panel--closed'}`}>
        <button
          className="config-toggle"
          onClick={handleConfigPanelToggle}
          type="button"
          aria-expanded={isConfigOpen}
          aria-controls="config-panel-content"
          aria-label={isConfigOpen ? 'Collapse config panel' : 'Open config panel'}
          title={isConfigOpen ? 'Collapse config panel' : 'Open config panel'}
        >
          {isConfigOpen ? '✕' : '⚙'}
        </button>
        <div className="config-content" id="config-panel-content" aria-hidden={!isConfigOpen}>
          <h2 className="config-title">Settings</h2>

          <label className="config-field">
            <span className="config-label">Time Font Size</span>
            <input
              type="range"
              min="72"
              max="320"
              step="2"
              value={timeFontSize}
              onChange={(event) => setTimeFontSize(Number(event.target.value))}
            />
            <span className="config-value">{timeFontSize}px</span>
          </label>

          <label className="config-field">
            <span className="config-label">Font</span>
            <select value={font} onChange={(event) => setFont(event.target.value as FontOptionValue)}>
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="config-field">
            <span className="config-label">Title Font Size</span>
            <input
              type="range"
              min="72"
              max="320"
              step="2"
              value={titleFontSize}
              onChange={(event) => setTitleFontSize(Number(event.target.value))}
            />
            <span className="config-value">{titleFontSize}px</span>
          </label>

          <label className="config-field">
            <span className="config-label">Time And Title Align</span>
            <select value={contentAlign} onChange={(event) => setContentAlign(event.target.value as AlignOptionValue)}>
              {ALIGN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="config-field">
            <span className="config-label">Control Panel Align</span>
            <select
              value={controlsAlign}
              onChange={(event) => setControlsAlign(event.target.value as ControlAlignOptionValue)}
            >
              {CONTROL_ALIGN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="config-fieldset">
            <legend className="config-label">Margins (px)</legend>
            <div className="config-grid-2">
              <label className="config-field">
                <span className="config-label">Up</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={contentMarginTop}
                  onChange={(event) => setContentMarginTop(clamp(parseInputNumber(event.target.value), 0, 500))}
                />
              </label>
              <label className="config-field">
                <span className="config-label">Down</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={contentMarginBottom}
                  onChange={(event) => setContentMarginBottom(clamp(parseInputNumber(event.target.value), 0, 500))}
                />
              </label>
              <label className="config-field">
                <span className="config-label">Left</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={contentMarginLeft}
                  onChange={(event) => setContentMarginLeft(clamp(parseInputNumber(event.target.value), 0, 500))}
                />
              </label>
              <label className="config-field">
                <span className="config-label">Right</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={contentMarginRight}
                  onChange={(event) => setContentMarginRight(clamp(parseInputNumber(event.target.value), 0, 500))}
                />
              </label>
            </div>
          </fieldset>

          <label className="config-field">
            <span className="config-label">Content Gap (px)</span>
            <input
              type="number"
              min="0"
              max="300"
              value={contentGap}
              onChange={(event) => setContentGap(clamp(parseInputNumber(event.target.value), 0, 300))}
            />
          </label>

          <label className="config-field config-field--checkbox">
            <input
              type="checkbox"
              checked={allowNegativeTime}
              onChange={(event) => setAllowNegativeTime(event.target.checked)}
            />
            <span className="config-label">Allow Negative Time</span>
          </label>
        </div>
      </aside>
      <main className={`countdown-page countdown-page--${contentAlign}`}>
        <div
          className="countdown-content"
          style={{
            gap: `${contentGap}px`,
            marginTop: `${contentMarginTop}px`,
            marginBottom: `${contentMarginBottom}px`,
            marginLeft: `${contentMarginLeft}px`,
            marginRight: `${contentMarginRight}px`,
          }}
        >
          <p
            className={`timer-value ${shownRemainingSeconds < 0 ? 'timer-value--negative' : ''}`}
            style={{ fontSize: `${timeFontSize}px`, fontFamily: selectedFont.family }}
          >
            {formatCountdown(shownRemainingSeconds)}
          </p>
          <p className="timer-title" style={{ fontSize: `${titleFontSize}px`, fontFamily: selectedFont.family }}>
            {titleText}
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
