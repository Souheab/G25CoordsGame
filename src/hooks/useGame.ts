import { useState, useCallback } from 'react'
import type { G25Entry } from '../utils/g25'
import { euclideanDistance, pickUniqueIndices } from '../utils/g25'

export type ChoiceResult = 'correct' | 'wrong' | null

export interface RoundState {
  target: G25Entry
  optionA: G25Entry
  optionB: G25Entry
  distanceA: number
  distanceB: number
  correctChoice: 'A' | 'B'
}

export const MAX_LIVES = 3

export interface GameState {
  round: RoundState | null
  score: number
  totalRounds: number
  lives: number
  gameOver: boolean
  lastResult: ChoiceResult
  chosenOption: 'A' | 'B' | null
}

export function useGame(entries: G25Entry[]) {
  const [state, setState] = useState<GameState>({
    round: null,
    score: 0,
    totalRounds: 0,
    lives: MAX_LIVES,
    gameOver: false,
    lastResult: null,
    chosenOption: null,
  })

  const newRound = useCallback(() => {
    if (entries.length < 3) return

    const [targetIdx, aIdx, bIdx] = pickUniqueIndices(entries.length, 3)
    const target = entries[targetIdx]
    const optionA = entries[aIdx]
    const optionB = entries[bIdx]
    const distanceA = euclideanDistance(target.coords, optionA.coords)
    const distanceB = euclideanDistance(target.coords, optionB.coords)
    const correctChoice: 'A' | 'B' = distanceA <= distanceB ? 'A' : 'B'

    setState((prev) => ({
      ...prev,
      round: { target, optionA, optionB, distanceA, distanceB, correctChoice },
      lastResult: null,
      chosenOption: null,
    }))
  }, [entries])

  const choose = useCallback(
    (choice: 'A' | 'B') => {
      setState((prev) => {
        if (!prev.round || prev.lastResult !== null || prev.gameOver) return prev
        const isCorrect = choice === prev.round.correctChoice
        const newLives = isCorrect ? prev.lives : prev.lives - 1
        return {
          ...prev,
          score: isCorrect ? prev.score + 1 : prev.score,
          totalRounds: prev.totalRounds + 1,
          lives: newLives,
          gameOver: newLives <= 0,
          lastResult: isCorrect ? 'correct' : 'wrong',
          chosenOption: choice,
        }
      })
    },
    []
  )

  const resetGame = useCallback(() => {
    setState({
      round: null,
      score: 0,
      totalRounds: 0,
      lives: MAX_LIVES,
      gameOver: false,
      lastResult: null,
      chosenOption: null,
    })
  }, [])

  return { state, newRound, choose, resetGame }
}
