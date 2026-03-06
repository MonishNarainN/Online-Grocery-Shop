import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { CHAT_API_URL } from '@/config';

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hi there! I'm your AI grocer assistant. What kind of dish or recipe are you looking for today?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${CHAT_API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMsg })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting to my recipe database right now. Please try again later!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const formatMessage = (text) => {
        // Basic Markdown formatting for bold and italics from the python server
        return text.split('\n').map((line, i) => {
            let formattedLine = line;
            // Bold
            formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italics
            formattedLine = formattedLine.replace(/_(.*?)_/g, '<em>$1</em>');

            return (
                <span key={i}>
                    <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                    <br />
                </span>
            );
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col mb-4 shadow-2xl border-white/10 bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
                    <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/5 bg-primary/10">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            AI Recipe Assistant
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        ref={scrollRef}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'bot' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                        : 'bg-muted/50 border border-white/5 rounded-bl-sm text-foreground/90'
                                        }`}
                                >
                                    {msg.role === 'bot' ? formatMessage(msg.content) : msg.content}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-muted/50 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75"></span>
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-3 border-t border-white/5 bg-background/50">
                        <div className="flex w-full items-center gap-2">
                            <Input
                                placeholder="E.g. Sweet dessert with milk..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-card/50 border-white/10"
                                disabled={isLoading}
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                className="shrink-0"
                                disabled={!inputValue.trim() || isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            {/* Floating Action Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-secondary hover:bg-secondary/80 text-foreground' : 'bg-primary hover:bg-primary/90'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </Button>
        </div>
    );
}
