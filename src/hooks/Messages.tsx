import { useState } from 'react';

interface Message {
  id: number;
  isBot: boolean;
  text: string;
}

type UseMessagesReturnType = [
  Message[],
  (newMessage: Message) => void,
  () => void
];

export function useMessages(array: Message[]): UseMessagesReturnType {
  const [messages, setMessages] = useState<Message[]>(array);

  const addMessage = async (newMessage: Message) => {

    setMessages(prevMessages => {
      return prevMessages.concat(newMessage)
    });

  };

  const flushMessage = (): void => {
    setMessages([])
  }

  return [messages, addMessage, flushMessage];
}
