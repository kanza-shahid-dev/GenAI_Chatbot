import { useLayoutEffect } from "react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const threadId = uuidv4();

  useEffect(() => {
    document.title = "GenAI Chatbot";
  }, []);

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

  useLayoutEffect(() => {
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

    if (!inputText || !textarea || isLoading) return;

    textarea.value = "";

    // User message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputText,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ threadId: threadId, message: inputText }),
      });

      if (!response.ok) return;
      const result = await response.json();

      // Bot message
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: String(result.message || "No response from server"),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white overflow-hidden">
      <div className="container mx-auto max-w-4xl h-[80vh] flex flex-col">
        <div className="flex-1 overflow-y-auto my-6 mb-[90px] p-4 rounded-xl custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`my-4 bg-neutral-800 p-4 rounded-xl ${
                message.type === "user"
                  ? "ml-auto max-w-fit"
                  : "mr-auto max-w-fit"
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="animate-pulse my-4 mr-auto max-w-fit">
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        <div className="fixed inset-x-0 bottom-0 flex items-center justify-center bg-neutral-950">
          <div className="bg-neutral-800 p-2 rounded-3xl w-full max-w-4xl mb-8">
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full resize-none outline-0 p-3 bg-inherit"
                rows={1.5}
                onKeyDown={handleKeyDown}
                ref={textareaRef}
                disabled={isLoading}
                placeholder="Hi, How Can I Help you?"
              ></textarea>
              <div className="flex justify-end items-center">
                <button
                  className="bg-white text-black rounded-full py-1 px-4 cursor-pointer hover:bg-neutral-200 transition"
                  onClick={handleAsk}
                  disabled={isLoading}
                >
                  Ask
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
