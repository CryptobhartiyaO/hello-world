import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';
import { ChatMessage } from '../types';
import { playClick } from '../utils/audio';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (txt: string) => void;
  userAddress: string;
}

export default function GlobalChat({ messages, onSendMessage, userAddress }: ChatProps) {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat to bottom when messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Minimal avatar avatar-letters helper based on seeds
  const getAvatarLetter = (sender: string) => {
    return sender.charAt(0).toUpperCase();
  };

  const getUserColor = (sender: string) => {
    const colours = [
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    ];
    let sum = 0;
    for (let i = 0; i < sender.length; i++) sum += sender.charCodeAt(i);
    return colours[sum % colours.length];
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col h-[320px] backdrop-blur-sm shadow-md">
      {/* Chat Title bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3 mb-3 flex-shrink-0">
        <MessageSquare className="size-4 text-emerald-400" />
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
          Global Decryption Hub
        </h2>
        <span className="text-[0.55rem] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-semibold ml-auto flex items-center gap-1 shrink-0 animate-pulse">
          <span className="size-1 rounded-full bg-emerald-400" />
          Encrypted Sync
        </span>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3 custom-scrollbar flex flex-col">
        {messages.map((m) => {
          const isUser = m.sender === userAddress;
          const userColorStyle = getUserColor(m.sender);

          if (m.isSystem) {
            return (
              <div 
                key={m.id}
                className="bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/80 text-[0.62rem] font-mono text-zinc-500 flex items-start gap-1.5"
              >
                <Cpu className="size-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-amber-500/80 font-bold uppercase tracking-wider block mb-0.5">
                    SOLANA POW PROTOCOL LOG
                  </span>
                  <span>{m.text}</span>
                </div>
                <span className="text-[0.55rem] text-zinc-600 self-center">{m.timestamp}</span>
              </div>
            );
          }

          return (
            <div 
              key={m.id} 
              className={`flex gap-2.5 items-start ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Custom tiny letter avatar profile */}
              <div className={`size-6 rounded-full border flex items-center justify-center font-mono text-[0.68rem] font-bold shrink-0 shadow-sm ${userColorStyle}`}>
                {getAvatarLetter(m.sender)}
              </div>

              {/* Message bubble */}
              <div className="flex flex-col max-w-[78%]">
                <div className={`flex items-baseline gap-1.5 mb-0.5 ${isUser ? 'justify-end' : ''}`}>
                  <span className={`text-[0.62rem] font-mono font-semibold ${isUser ? 'text-rose-400' : 'text-zinc-400'}`}>
                    {isUser ? 'You' : `${m.sender.substring(0, 6)}...${m.sender.substring(m.sender.length - 4)}`}
                  </span>
                  <span className="text-[0.52rem] font-mono text-zinc-600">
                    {m.timestamp}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border text-xs leading-normal font-sans ${
                  isUser 
                    ? 'bg-rose-500/10 border-rose-500/20 text-zinc-200 rounded-tr-none text-right' 
                    : 'bg-zinc-950/60 border-zinc-900/80 text-zinc-300 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input container footer */}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Broadcast coordinates or ask solvers..."
          className="flex-1 bg-zinc-950 text-xs font-mono border border-zinc-900 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors"
        />
        <button
          type="submit"
          className="bg-rose-600 hover:bg-rose-500 p-2 rounded-lg border border-transparent hover:shadow-lg active:translate-y-px transition-all text-white"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
