import type { G25Entry } from '../utils/g25'

interface Props {
  entry: G25Entry
  label: 'A' | 'B'
  onClick: () => void
  disabled: boolean
  revealed: boolean
  isChosen: boolean
  isCorrect: boolean
  distance: number
}

export function GroupCard({
  entry,
  label,
  onClick,
  disabled,
  revealed,
  isChosen,
  isCorrect,
  distance,
}: Props) {
  let borderClass = 'border-slate-600 hover:border-indigo-400'
  let bgClass = 'bg-slate-800 hover:bg-slate-700'

  if (revealed) {
    if (isCorrect) {
      borderClass = 'border-emerald-500'
      bgClass = 'bg-emerald-900/40'
    } else if (isChosen && !isCorrect) {
      borderClass = 'border-red-500'
      bgClass = 'bg-red-900/40'
    } else {
      borderClass = 'border-slate-600'
      bgClass = 'bg-slate-800'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full rounded-2xl border-2 p-6 text-left transition-all duration-200
        ${borderClass} ${bgClass}
        disabled:cursor-default
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
      `}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {label}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold leading-tight text-white break-words">
            {entry.name}
          </p>
          {revealed && (
            <p
              className={`mt-2 text-sm font-medium ${
                isCorrect ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              Distance: {distance.toFixed(6)}
              {isCorrect && (
                <span className="ml-2 rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-300">
                  Closest
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
