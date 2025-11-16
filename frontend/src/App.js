import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
export default function App() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const threadId = uuidv4();
    useEffect(() => {
        // Focus textarea after messages update (when not loading)
        if (!isLoading) {
            textareaRef.current?.focus();
        }
    }, [messages, isLoading]);
    // Auto-scroll to bottom when messages change or loading state changes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleAsk();
        }
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        handleAsk();
    };
    const handleAsk = async () => {
        const textarea = textareaRef.current;
        const inputText = textarea?.value?.trim();
        if (!inputText || !textarea || isLoading)
            return;
        textarea.value = "";
        //api call
        const userMessage = {
            id: Date.now(),
            type: "user",
            content: inputText,
        };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ threadId: threadId, message: inputText }),
            });
            if (!response.ok)
                return;
            const result = await response.json();
            // Add bot message
            const botMessage = {
                id: Date.now() + 1,
                type: "bot",
                content: String(result.message || "No response from server"),
            };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
        catch (error) {
            console.error("Error calling API:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-neutral-950 text-white overflow-x-hidden", children: _jsxs("div", { className: "container mx-auto max-w-4xl pb-45", children: [_jsxs("div", { className: "my-6 p-4 rounded-xl", children: [messages.map((message) => (_jsx("div", { className: `my-4 bg-neutral-800 p-4 rounded-xl ${message.type === "user"
                                ? "ml-auto max-w-fit"
                                : "mr-auto max-w-fit"}`, children: message.content }, message.id))), isLoading && (_jsx("div", { className: "animate-pulse my-4 mr-auto max-w-fit", children: "Thinking..." })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "fixed inset-x-0 bottom-0 flex items-center justify-center bg-neutral-950", children: _jsx("div", { className: "bg-neutral-800 p-2 rounded-3xl w-full max-w-4xl mb-8", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("textarea", { className: "w-full resize-none outline-0 p-3 bg-inherit", rows: 1.5, onKeyDown: handleKeyDown, ref: textareaRef, disabled: isLoading, placeholder: "Hi, How Can I Help you?" }), _jsx("div", { className: "flex justify-end items-center", children: _jsx("button", { className: "bg-white text-black rounded-full py-1 px-4 cursor-pointer hover:bg-neutral-200 transition", onClick: handleAsk, disabled: isLoading, children: "Ask" }) })] }) }) })] }) }));
}
