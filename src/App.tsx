import { useEffect, useState } from 'react'
import { parseG25 } from './utils/g25'
import { useGame, MAX_LIVES } from './hooks/useGame'
import { GroupCard } from './components/GroupCard'
import rawData from './G25_Modern_NoSim.txt?raw'
import './App.css'

const entries = parseG25(rawData)

type Screen = 'home' | 'playing' | 'gameover'

function Hearts({ lives }: { lives: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: MAX_LIVES }).map((_, i) => (
        <span key={i} className={`text-xl ${i < lives ? 'text-red-500' : 'text-slate-700'}`}>
          ♥
        </span>
      ))}
    </div>
  )
}

// ─── Home Screen ────────────────────────────────────────────────────────────
function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-white">
        G25 Distance Game
      </h1>
      <p className="mb-2 text-lg text-slate-400">
        Test your knowledge of genetic distances between world populations.
      </p>
      <p className="mb-10 text-sm text-slate-500 max-w-md">
        You'll be shown a <span className="text-white font-medium">target population</span> and two
        candidates. Pick the one that is{' '}
        <span className="text-indigo-400 font-medium">genetically closer</span>. You have{' '}
        <span className="text-red-400 font-medium">3 lives</span>. Wrong answers cost one life.
        How far can you get?
      </p>
      <button
        onClick={onStart}
        className="rounded-2xl bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-500 active:scale-95"
      >
        Start Game
      </button>
    </div>
  )
}

// ─── Game Over Screen ────────────────────────────────────────────────────────
function GameOverScreen({
  score,
  totalRounds,
  onPlayAgain,
}: {
  score: number
  totalRounds: number
  onPlayAgain: () => void
}) {
  const pct = totalRounds === 0 ? 0 : Math.round((score / totalRounds) * 100)
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-6xl">💀</p>
      <h2 className="mb-1 text-4xl font-extrabold text-white">Game Over</h2>
      <p className="mb-8 text-slate-400">You ran out of lives.</p>
      <div className="mb-8 flex gap-8 rounded-2xl border border-slate-700 bg-slate-800 px-10 py-6">
        <div>
          <p className="text-3xl font-bold text-white">{score}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Correct</p>
        </div>
        <div className="w-px bg-slate-700" />
        <div>
          <p className="text-3xl font-bold text-white">{totalRounds}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Rounds</p>
        </div>
        <div className="w-px bg-slate-700" />
        <div>
          <p className="text-3xl font-bold text-indigo-400">{pct}%</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Accuracy</p>
        </div>
      </div>
      <button
        onClick={onPlayAgain}
        className="rounded-2xl bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-500 active:scale-95"
      >
        Play Again
      </button>
    </div>
  )
}

// ─── Playing Screen ──────────────────────────────────────────────────────────
function PlayingScreen({
  state,
  newRound,
  choose,
  onGameOver,
}: {
  state: ReturnType<typeof useGame>['state']
  newRound: () => void
  choose: (c: 'A' | 'B') => void
  onGameOver: () => void
}) {
  const { round, score, totalRounds, lastResult, chosenOption, lives, gameOver } = state

  // Transition to game-over screen after revealing the fatal wrong answer
  useEffect(() => {
    if (gameOver && lastResult === 'wrong') {
      const t = setTimeout(onGameOver, 1200)
      return () => clearTimeout(t)
    }
  }, [gameOver, lastResult, onGameOver])

  const revealed = lastResult !== null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-white">G25 Distance Game</h1>
          <p className="text-xs text-slate-500">Which population is genetically closer?</p>
        </div>
        <div className="flex items-center gap-4">
          <Hearts lives={lives} />
          <div className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300">
            Score:{' '}
            <strong className="text-white">
              {score}/{totalRounds}
            </strong>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          {round ? (
            <>
              {/* Target */}
              <div className="mb-6 rounded-2xl border border-indigo-500/40 bg-indigo-950/60 p-5 text-center">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  Target Population
                </p>
                <p className="text-2xl font-bold text-white">{round.target.name}</p>
              </div>

              {/* Prompt */}
              <p className="mb-4 text-center text-sm font-medium text-slate-400">
                Which of the two populations below has a{' '}
                <span className="text-white">lower genetic distance</span> to the target?
              </p>

              {/* Options */}
              <div className="flex flex-col gap-3">
                <GroupCard
                  entry={round.optionA}
                  label="A"
                  onClick={() => choose('A')}
                  disabled={revealed}
                  revealed={revealed}
                  isChosen={chosenOption === 'A'}
                  isCorrect={round.correctChoice === 'A'}
                  distance={round.distanceA}
                />
                <GroupCard
                  entry={round.optionB}
                  label="B"
                  onClick={() => choose('B')}
                  disabled={revealed}
                  revealed={revealed}
                  isChosen={chosenOption === 'B'}
                  isCorrect={round.correctChoice === 'B'}
                  distance={round.distanceB}
                />
              </div>

              {/* Result banner */}
              {revealed && (
                <div className="mt-6 flex flex-col items-center gap-4">
                  <div
                    className={`w-full rounded-xl px-5 py-3 text-center font-semibold ${
                      lastResult === 'correct'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {lastResult === 'correct' ? '✓ Correct!' : '✗ Wrong!'}{' '}
                    <span className="font-normal opacity-80">
                      {round.correctChoice === 'A' ? round.optionA.name : round.optionB.name} was
                      closer (d ={' '}
                      {Math.min(round.distanceA, round.distanceB).toFixed(6)})
                    </span>
                  </div>
                  {!gameOver && (
                    <button
                      onClick={newRound}
                      className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-500 active:scale-95"
                    >
                      Next Round →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-500">Loading…</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const { state, newRound, choose, resetGame } = useGame(entries)

  const handleStart = () => {
    resetGame()
    setScreen('playing')
  }

  // Kick off first round when entering playing screen
  useEffect(() => {
    if (screen === 'playing' && !state.round) {
      newRound()
    }
  }, [screen, state.round, newRound])

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {screen === 'home' && <HomeScreen onStart={handleStart} />}
      {screen === 'playing' && (
        <PlayingScreen
          state={state}
          newRound={newRound}
          choose={choose}
          onGameOver={() => setScreen('gameover')}
        />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          score={state.score}
          totalRounds={state.totalRounds}
          onPlayAgain={handleStart}
        />
      )}
    </div>
  )
}

export default App
