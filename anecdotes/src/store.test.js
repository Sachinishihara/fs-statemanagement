import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('./services/anecdotes', () => ({
  default: {
    getAll: vi.fn(),
    createNew: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  }
}))

import anecdoteService from './services/anecdotes'
import useAnecdoteStore, { useAnecdotes, useAnecdoteActions } from './store'

beforeEach(() => {
  useAnecdoteStore.setState({
    anecdotes: [],
    filter: ''
  })

  vi.clearAllMocks()
})

describe('anecdote store', () => {
  it('initializes anecdotes from backend', async () => {
    const anecdotes = [
      { id: '1', content: 'First anecdote', votes: 0 },
      { id: '2', content: 'Second anecdote', votes: 0 }
    ]

    anecdoteService.getAll.mockResolvedValue(anecdotes)

    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.initialize()
    })

    const { result: anecdotesResult } = renderHook(() => useAnecdotes())

    expect(anecdotesResult.current).toEqual(anecdotes)
  })
})

describe('anecdote sorting', () => {
  it('sorts anecdotes by votes', () => {
    const anecdotes = [
      { id: '1', content: 'First anecdote', votes: 2 },
      { id: '2', content: 'Second anecdote', votes: 5 },
      { id: '3', content: 'Third anecdote', votes: 0 }
    ]

    useAnecdoteStore.setState({ anecdotes })

    const { result } = renderHook(() => useAnecdotes())

    expect(result.current).toEqual([
      anecdotes[1],
      anecdotes[0],
      anecdotes[2]
    ])
  })
})

describe('anecdote filtering', () => {
  it('filters anecdotes correctly', () => {
    const anecdotes = [
      { id: '1', content: 'Learning React', votes: 2 },
      { id: '2', content: 'Learning Python', votes: 5 },
      { id: '3', content: 'React is useful', votes: 3 }
    ]

    useAnecdoteStore.setState({
      anecdotes,
      filter: 'react'
    })

    const { result } = renderHook(() => useAnecdotes())

    expect(result.current).toEqual([
      anecdotes[2],
      anecdotes[0]
    ])
  })
})

describe('anecdote voting', () => {
  it('increases votes by one', async () => {
    const anecdote = {
      id: '1',
      content: 'Learning React',
      votes: 2
    }

    useAnecdoteStore.setState({
      anecdotes: [anecdote]
    })

    const updated = { ...anecdote, votes: 3 }

    anecdoteService.update.mockResolvedValue(updated)

    const { result } = renderHook(() => useAnecdoteActions())

    await act(async () => {
      await result.current.vote(anecdote.id)
    })

    expect(anecdoteService.update).toHaveBeenCalledWith(
      anecdote.id,
      updated
    )

    expect(useAnecdoteStore.getState().anecdotes[0].votes)
      .toBe(3)
  })
})
