import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || thinking) return;

    const updatedMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(updatedMessages);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>Claude Chatbot</h1>
      </header>

      <main className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">Send a message to start the conversation.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble-wrapper ${msg.role}`}>
            <div className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="chat-bubble-wrapper assistant">
            <div className="chat-bubble assistant thinking">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="chat-input-area">
        <textarea
          className="chat-input"
          rows={1}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={thinking}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={thinking || !input.trim()}
        >
          Send
        </button>
      </footer>
    </div>
  );
}

export default App;
