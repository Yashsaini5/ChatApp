import React from 'react'
import { useState } from 'react'
import io from 'socket.io-client'

const socket = io("http://localhost:5000")

const messages = () => {
    const [message, setMessage] = useState("")
    const [allMessage, setAllMessage] = useState([])

    useEffect(() => {
      socket.on("receive_message",(data) => {
        console.log("Message received:", data)
        setAllMessage(prev => [...prev,data])
      })
    
      return () => {
        socket.disconnect()
      }
    }, [])

    const sendMessage = () => {
        socket.emit("send_message",{
            message,
            time: new Date().toLocaleTimeString(),
        })
        setMessage("")
    }
    
  return (
    <div>
      
    </div>
  )
}

export default messages
