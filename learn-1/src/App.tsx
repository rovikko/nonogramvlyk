import { useEffect, useRef, useState, } from 'react';
import './App.css'
import robotImg from './assets/robot.png'
import userImg from './assets/user.png'

type Message = {
  message: string;
  sender: 'user' | 'robot';
  id: string;
}

function ChatInput({ chatMessages, setChatMessages }) {
  const [inputText, setInputText] = useState('')

  function sendMessage() {
    const newMsg = { message: inputText, sender: 'user', id: crypto.randomUUID() };
    const newMsgParrot = { message: inputText, sender: 'robot', id: crypto.randomUUID() };
    setChatMessages([...chatMessages, newMsg, newMsgParrot])
    setInputText('')
  }

  function onInputChange(event) {
    setInputText(event.target.value)
  }

  return (
    <div className='input-container'>
      <input className='text-input' placeholder='please type in your message' size={30} onChange={onInputChange} value={inputText} />
      <button className='input-button' onClick={sendMessage}>Send</button>
    </div>
  )
}

function ChatMessage({ message, sender }: Partial<Message>) {
  return (
    <div className={sender === 'user' ? 'message-container user' : 'message-container'}>
      {sender === 'robot' && <img className='sender-image' src={robotImg} />}
      <div className='message-text'>
        {message}
      </div>
      {sender === 'user' && <img className='sender-image' src={userImg} />}
    </div>
  )
}

function ChatMessages({ chatMessages }) {
  const thisRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const containerRef = thisRef.current;
    if (containerRef) {
      containerRef.scrollTop = containerRef.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className='messages-container' ref={thisRef}>
      {chatMessages.map(m => <ChatMessage message={m.message} sender={m.sender} key={m.id} />
      )}
    </div> 
  )
}

function App() {
  const [chatMessages, setChatMessages] = useState([] as Message[])

  return (
    <div className='app-container'>
      <ChatMessages chatMessages={chatMessages} />
      <ChatInput chatMessages={chatMessages} setChatMessages={setChatMessages} />
    </div>
  )
}

export default App
