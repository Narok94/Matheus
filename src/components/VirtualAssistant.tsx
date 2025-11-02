import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { FuturisticOrbIcon, SpinnerIcon, UserCircleIcon } from './Icons';
import { Modal, Input, Button } from './common';

export type AssistantCommand = {
  name: string;
  args: { [key: string]: any };
};

interface VirtualAssistantProps {
  userName: string;
  onCommand: (command: AssistantCommand) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

type Message = {
    sender: 'user' | 'ai';
    text: string;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

const ORB_SIZE = 56;
const EDGE_MARGIN = 16;
const LONG_PRESS_DURATION = 700; // ms
const BOTTOM_NAV_ESTIMATED_HEIGHT = 96; // Corresponds to pb-24 on main content

const AssistantModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
}> = ({ isOpen, onClose, messages, onSendMessage, isProcessing }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;
        onSendMessage(input);
        setInput('');
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assistente InspecPro">
            <div className="flex flex-col h-[60vh] bg-primary/80 dark:bg-black/50 text-text-primary">
                <div className="flex-grow overflow-y-auto p-4 space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                                    <FuturisticOrbIcon />
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-lg ${
                                msg.sender === 'user' 
                                ? 'bg-accent/90 text-white rounded-br-lg' 
                                : 'bg-secondary/70 backdrop-blur-sm border border-border/20 text-text-primary rounded-bl-lg'
                            }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {msg.sender === 'user' && (
                                <div className="w-8 h-8 flex-shrink-0 border-2 border-border/50 rounded-full flex items-center justify-center text-text-secondary">
                                    <UserCircleIcon className="w-5 h-5"/>
                                </div>
                            )}
                        </div>
                    ))}
                    {isProcessing && (
                         <div className="flex items-start gap-3 justify-start">
                             <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                                <FuturisticOrbIcon isProcessing />
                            </div>
                             <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-secondary/70 backdrop-blur-sm border border-border/20 text-text-primary rounded-bl-lg">
                                <div className="flex items-center gap-2">
                                    <SpinnerIcon className="w-4 h-4 text-accent" />
                                    <p className="text-sm text-text-secondary italic">Pensando...</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border/30 bg-primary/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Converse com o assistente..."
                            disabled={isProcessing}
                            className="flex-grow !bg-secondary/50 !border-border/30 focus:!ring-accent/70 focus:!border-accent/80 transition-all"
                        />
                        <Button type="submit" disabled={isProcessing || !input.trim()} className="!rounded-full !w-12 !h-12 !p-0 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </Button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export const VirtualAssistantButton: React.FC<VirtualAssistantProps> = ({ userName, onCommand, showToast }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - ORB_SIZE - EDGE_MARGIN, y: window.innerHeight - ORB_SIZE - BOTTOM_NAV_ESTIMATED_HEIGHT - EDGE_MARGIN });
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const recognitionRef = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const didLongPress = useRef(false);
  const dragInfo = useRef({ offsetX: 0, offsetY: 0, hasMoved: false });

  useEffect(() => {
    if (isModalOpen && messages.length === 0) {
        setMessages([{
            sender: 'ai',
            text: `Olá, ${userName}. Sou o assistente de IA do InspecPro. Estou à disposição para ajudar.`
        }]);
    }
  }, [isModalOpen, userName, messages.length]);

  const processCommand = useCallback(async (transcript: string) => {
    setIsProcessing(true);
    const isFromModal = messages.some(m => m.sender === 'user' && m.text === transcript);
    if (!isFromModal) {
        showToast(`Processando: "${transcript}"`);
    }

    // Fix: Use process.env.API_KEY and initialize GoogleGenAI as per coding guidelines.
    // This also resolves the TypeScript error for `import.meta.env`.
    if (!process.env.API_KEY) {
        const errorMsg = 'Chave da API não configurada. Verifique suas variáveis de ambiente.';
        showToast(errorMsg, 'error');
        if (isFromModal) setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
        setIsProcessing(false);
        return;
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `Você é o assistente de IA do InspecPro. Seu tom é estritamente profissional, claro e conciso. Sua principal função é interpretar o comando do usuário e executar a função apropriada com os argumentos corretos. O nome do usuário é ${userName}. Para datas, converta termos como "hoje", "amanhã" ou "próxima sexta-feira" para o formato AAAA-MM-DD, considerando que a data atual é ${new Date().toISOString().split('T')[0]}.`;
    const tools: FunctionDeclaration[] = [ /* ... tools declarations ... */ ];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Comando do usuário: "${transcript}"`,
            config: { tools: [{ functionDeclarations: tools }], systemInstruction }
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            onCommand({ name: call.name, args: call.args });
            if (isFromModal) {
                setMessages(prev => [...prev, { sender: 'ai', text: `Comando '${call.name}' executado com sucesso.` }]);
            }
        } else {
            const textResponse = response.text;
            if (textResponse) {
                if (isFromModal) {
                    setMessages(prev => [...prev, { sender: 'ai', text: textResponse }]);
                } else {
                    showToast(textResponse);
                }
            } else {
                const errorMsg = 'Não foi possível compreender o comando. Por favor, tente novamente.';
                if (isFromModal) setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
                else showToast(errorMsg, 'error');
            }
        }
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMsg = 'Ocorreu um erro de conexão. Por favor, tente novamente em alguns instantes.';
      if (isFromModal) setMessages(prev => [...prev, { sender: 'ai', text: errorMsg }]);
      else showToast(errorMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [onCommand, showToast, userName, messages]);
  
  const handleSendMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: 'user', text: text }]);
    processCommand(text);
  };
  
  const startListening = useCallback(() => {
    if (!isSpeechSupported) {
        showToast('Reconhecimento de voz não é suportado neste navegador.', 'error');
        return;
    }
    if (isListening || isProcessing) return;
    try {
        recognitionRef.current?.start();
    } catch (e) {
        console.error("Could not start recognition:", e);
        setIsListening(false);
    }
  }, [isListening, isProcessing, showToast]);

  useEffect(() => {
    if (!isSpeechSupported) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => { 
        console.error('Speech recognition error', event.error);
        let errorMessage = 'Ocorreu um erro com o reconhecimento de voz.';
        if (event.error === 'no-speech') {
            errorMessage = 'Nenhuma fala foi detectada. Tente novamente.';
        } else if (event.error === 'not-allowed') {
            errorMessage = 'A permissão para o microfone foi negada.';
        }
        showToast(errorMessage, 'error');
        setIsListening(false);
     };
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) processCommand(transcript);
    };
    recognitionRef.current = recognition;
  }, [processCommand, showToast]);

  useEffect(() => {
    const handleResize = () => {
      setPosition(currentPosition => {
        const newX = Math.max(
            EDGE_MARGIN,
            Math.min(currentPosition.x, window.innerWidth - ORB_SIZE - EDGE_MARGIN)
        );
        const newY = Math.max(
            EDGE_MARGIN,
            Math.min(currentPosition.y, window.innerHeight - ORB_SIZE - EDGE_MARGIN)
        );
        
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    if (!dragInfo.current.hasMoved) {
      const rect = buttonRef.current!.getBoundingClientRect();
      const startX = rect.left + dragInfo.current.offsetX;
      const startY = rect.top + dragInfo.current.offsetY;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        dragInfo.current.hasMoved = true;
      }
    }
    
    if(dragInfo.current.hasMoved) {
        e.preventDefault();
        const newX = e.clientX - dragInfo.current.offsetX;
        const newY = e.clientY - dragInfo.current.offsetY;
        
        const clampedX = Math.max(EDGE_MARGIN, Math.min(newX, window.innerWidth - ORB_SIZE - EDGE_MARGIN));
        const clampedY = Math.max(EDGE_MARGIN, Math.min(newY, window.innerHeight - ORB_SIZE - EDGE_MARGIN));

        setPosition({ x: clampedX, y: clampedY });
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    }

    if (!dragInfo.current.hasMoved && !didLongPress.current) {
        // This is a quick click
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setIsModalOpen(true);
        }
    }

    setIsDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };
  
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragInfo.current.hasMoved = false;
    didLongPress.current = false;
    setIsDragging(true);

    if (!isListening) {
        longPressTimer.current = window.setTimeout(() => {
            if (!dragInfo.current.hasMoved) {
                didLongPress.current = true;
                startListening();
            }
        }, LONG_PRESS_DURATION);
    }

    const rect = buttonRef.current!.getBoundingClientRect();
    dragInfo.current.offsetX = e.clientX - rect.left;
    dragInfo.current.offsetY = e.clientY - rect.top;
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const buttonStyle: React.CSSProperties = {
    position: 'fixed', left: position.x, top: position.y,
    touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'transform 0.2s, opacity 0.2s',
    transform: `scale(${isDragging && dragInfo.current.hasMoved ? 0.95 : 1})`,
    opacity: isDragging && dragInfo.current.hasMoved ? 0.8 : 1,
  };

  return (
    <>
        <button
          ref={buttonRef}
          style={buttonStyle}
          className="z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 bg-black/40 backdrop-blur-sm border border-white/10"
          onPointerDown={handlePointerDown}
          aria-label="Assistente Virtual"
        >
          <FuturisticOrbIcon isListening={isListening} isProcessing={isProcessing && !isModalOpen} />
        </button>
        <AssistantModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing && isModalOpen}
        />
    </>
  );
};
