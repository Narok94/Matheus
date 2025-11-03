import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Modal } from './common';
import { SparklesIcon, SendIcon } from './Icons';

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

// FIX: Create the VirtualAssistant component which was missing, resolving module error.
export const VirtualAssistant: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setMessages([{ sender: 'bot', text: 'Olá! Sou o assistente virtual do InspecPro. Como posso ajudar você hoje?' }]);
        }
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // FIX: Initialize GoogleGenAI according to guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // Prepare history for the chat session
            const history = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            
            // FIX: Use the Chat API for conversations as it's more suitable.
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                    systemInstruction: 'You are a friendly and helpful assistant for InspecPro, an application for managing safety inspections. Your name is InspecBot. Keep your answers concise and in Brazilian Portuguese.'
                }
            });

            const response = await chat.sendMessage({ message: currentInput });
            
            // FIX: Extract text from response using the correct .text property.
            const botResponseText = response.text;
            
            const botMessage: Message = { sender: 'bot', text: botResponseText };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: Message = { sender: 'bot', text: 'Desculpe, não consegui processar sua solicitação. Tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assistente Virtual">
            <div className="flex flex-col h-[60vh]">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'bot' && <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full items-center justify-center bg-accent/20 text-accent"><SparklesIcon className="w-5 h-5"/></span>}
                            <div className={`flex w-full max-w-xs md:max-w-md flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                                <div className={`flex items-center space-x-2 rtl:space-x-reverse ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                    <span className="text-sm font-semibold text-text-primary">{msg.sender === 'user' ? 'Você' : 'InspecBot'}</span>
                                </div>
                                <div className={`leading-1.5 p-3 border-border ${msg.sender === 'user' ? 'rounded-s-xl rounded-ee-xl bg-accent text-white' : 'bg-secondary rounded-e-xl rounded-es-xl'}`}>
                                    <p className="text-sm font-normal break-words">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center justify-center py-2">
                            <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-accent"></div>
                            <p className="ml-2 text-sm text-text-secondary">Pensando...</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-4 pt-2 border-t border-border">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent placeholder-text-secondary transition-colors"
                            disabled={isLoading}
                        />
                        <button type="submit" className="p-3 bg-accent text-white rounded-lg disabled:opacity-50 transition-opacity" disabled={isLoading || !input.trim()}>
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};