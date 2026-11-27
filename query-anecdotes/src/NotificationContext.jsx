import { createContext, useState, useRef } from 'react'

const NotificationContext = createContext()

export const NotificationContextProvider = ({ children }) => {
  const [notification, setNotification] = useState('')
  const timeout = useRef(null)

  const notify = (message) => {
    clearTimeout(timeout.current)
    setNotification(message)

    timeout.current = setTimeout(() => {
      setNotification('')
    }, 5000)
  }

  return (
    <NotificationContext.Provider value={{ notification, notify }}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
