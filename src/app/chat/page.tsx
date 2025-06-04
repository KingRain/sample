"use client"

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ChatInput from "../../components/ChatInput"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navbar from '../../components/Navbar';
import type { User } from '@supabase/supabase-js';

const supabase = createClientComponentClient();
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const models: { name: string; id: string; type: 'text' | 'image' }[] = [
  { name: 'Gemini 1.5', id: 'gemini-1.5-flash', type: 'text' },
  { name: 'Gemini 2.0 Flash', id: 'gemini-2.0-flash-lite', type: 'text' },
  { name: 'Gemini 2.0 Flash (Image)', id: 'gemini-2.0-flash', type: 'image' }
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

export default function ChatPage() {
  const [, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
    };
    getSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    const userMessage: Message = { 
      role: "user", 
      content: message, 
      type: selectedModel.type as 'text' | 'image' 
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: selectedModel.id });
      
      if (selectedModel.type === 'image') {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: message,
            model: selectedModel.id
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const data = await response.json();
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: '',
            type: 'image' as const,
            imageUrl: data.fileName
          }
        ]);
      } else {
        const response = await model.generateContent(message);
        const text = await response.response.text();
        setMessages(prev => [...prev, { role: "assistant", content: text, type: 'text' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't generate a response. Please try again.",
        type: 'text'
      }]);
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-root">
      <Navbar />
      <style jsx global>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          html, body, #__next {
            height: 100%;
            margin: 0;
            padding: 0;
            background: #1a1a1a;
          }
          * {
            font-family: 'Inter', sans-serif;
            box-sizing: border-box;
          }
        `}
      </style>
      <style jsx>
        {`
        .chat-root {
          min-height: 100vh;
          background: #1a1a1a;
          display: flex;
          flex-direction: column;
        }
        .chat-container {
          width: 100vw;
          max-width: 100vw;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          flex: 1;
          height: calc(100vh - 60px);  /* Adjusted height to account for navbar */
        }
        .chat-messages {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 16px 0 90px 0;
          width: 100vw;
        }
        .chat-message {
          width: 100vw;
          padding: 0 16px;
        }
        .chat-divider {
          border: none;
          border-top: 1px solid #333;
          margin: 16px 0;
        }
        .chat-message-content {
          width: 100%;
        }
        .chat-message-content p {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.6;
          color: #fff;
          word-break: break-word;
        }
        .chat-message.user p {
          color: #aeefff;
        }
        .chat-message.assistant p {
          color: #fff;
        }
        .chat-message img {
          max-width: 100%;
          border-radius: 8px;
          margin: 8px 0;
          display: block;
        }
        @media (max-width: 600px) {
          .chat-container {
            max-width: 100vw;
            padding: 0;
          }
          .chat-messages {
            padding: 8px 0 90px 0;
          }
          .chat-message {
            padding: 0 8px;
          }
        }
        footer {
          width: 100vw;
          max-width: 100vw;
          margin: 0;
          left: 0;
          right: 0;
          background: #222;
          padding: 12px 0 8px 0;
        }
        `}
      </style>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index}>
              <div
                className={`chat-message ${msg.role}`}
              >
                <div className="chat-message-content">
                  {msg.type === 'image' && msg.imageUrl ? (
                    <Image
                      src={msg.imageUrl}
                      alt="Generated"
                      width={512}
                      height={512}
                      style={{ maxWidth: "100%", borderRadius: "8px", margin: "8px 0", display: "block" }}
                      unoptimized
                    />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
              {index < messages.length - 1 && <hr className="chat-divider" />}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <footer className="position-fixed bottom-0 left-0 right-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            models={models}
            isLoading={isLoading} />
        </footer>
      </div>
    </div>
  );
}
