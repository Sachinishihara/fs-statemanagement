import { create } from 'zustand'
import anecdoteService from './services/anecdotes'
import useNotificationStore from './notificationStore'

const useAnecdoteStore = create((set, get) => ({
  anecdotes: [],
  filter: '',

  actions: {
    initialize: async () => {
      const anecdotes = await anecdoteService.getAll()
      set({ anecdotes })
    },

    vote: async (id) => {
      const anecdote = get().anecdotes.find(a => a.id === id)

      const updated = await anecdoteService.update(
        id, { ...anecdote, votes: anecdote.votes + 1 }
      )

      set(state => ({
        anecdotes: state.anecdotes.map(a =>
          a.id === id ? updated : a
        )
      }))

      useNotificationStore.getState().showNotification(
        `you voted '${anecdote.content}'`
      )
    },

    add: async (content) => {
      const newAnecdote = await anecdoteService.createNew(content)

      set(state => ({
        anecdotes: state.anecdotes.concat(newAnecdote)
      }))

      useNotificationStore.getState().showNotification(
        `you created '${content}'`
      )
    },

    remove: async (id) => {
      const anecdote = get().anecdotes.find(a => a.id === id)

      if (!anecdote || anecdote.votes !== 0) return

      await anecdoteService.remove(id)

      set(state => ({
        anecdotes: state.anecdotes.filter(a => a.id !== id)
      }))
    },

    setFilter: filter => set({ filter })
  }
}))

export const useAnecdotes = () => {
  const anecdotes = useAnecdoteStore(state => state.anecdotes)
  const filter = useAnecdoteStore(state => state.filter)

  return anecdotes.filter(anecdote =>
    anecdote.content.toLowerCase().includes(filter.toLowerCase())
  )
}

export const useAnecdoteActions = () =>
  useAnecdoteStore(state => state.actions)
