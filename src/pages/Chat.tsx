import React, { useCallback, useEffect, useState } from 'react';
import Loader from '../components/Loader';
import './Chat.scss'
import { useMessages } from '../hooks/Messages'
import sendMessageListener, { sendMessage, Message } from '../services/sendMessage'

/**
 * 
 */
interface ClearBtnProps {
  onClick: () => void
}
const ClearBtn = ({ onClick }: ClearBtnProps) => {

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full text-gray-500 hover:text-red-400 focus:outline-none"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>
  )
}

/**
 * 
 */
interface ChatTextAreaProps {
  value: string,
  setValue: React.Dispatch<React.SetStateAction<string>>,
  onSubmit: () => void
}
const ChatTextArea = ({ value, setValue, onSubmit }: ChatTextAreaProps) => {

  return (
    <textarea
      onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && onSubmit()}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="flex-grow h-16 px-4 py-2 mx-1 text-lg font-medium text-gray-800 rounded-lg resize-none"
      placeholder="Type a message"
    />
  )
}


/**
 * 
 */
interface ChatSubmitBtnProps {
  onClick: () => void
}

const ChatSubmitBtn = ({ onClick }: ChatSubmitBtnProps) => {
  return (
    <button
      className="flex-shrink px-4 py-2 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
      onClick={onClick}
    >
      Send
    </button>
  )
}


/**
 * Chat page
 * @returns 
 */
const Chat = () => {

  const [upcommingText, setUpcommingText] = useState('')
  const [messageInput, setMessageInput] = useState('');
  const [messages, addMessage, flushMessage] = useMessages([])

  const stackMessage = () => {
    addMessage({ id: messages.length, isBot: false, text: messageInput })
    setMessageInput('');
  }

  /**
   * 주요 기능 core function
   */
  useEffect(() => {

    const isUserMessage = messages.length > 0 && !messages[messages.length - 1].isBot
    if (isUserMessage)
      sendMessage(messages)
    else
      console.log('init messages or bot message')

  }, [messages])


  /**
   * 청크 chunk receive handler (open ai 답변의 스트리밍된 청크를 emit하도록 이벤트 리스너를 다른 파일에 설정해뒀음)
   */
  useEffect(() => {

    const chunkReceivedHandler = (chunkContent: string) => {
      setUpcommingText((prevText) => prevText + chunkContent);
      console.log('upcommingText', upcommingText)
    };

    // openai api 답변 리스너
    sendMessageListener.on('chunk_received', chunkReceivedHandler);

    // unmount 시 해제해서 중복방지
    return () => {
      sendMessageListener.off('chunk_received', chunkReceivedHandler);
    }
  }, []);



  /**
   * 스트림 완료 stream complete listener
   */
  const handleStreamComplete = useCallback(() => {
    addMessage({ id: messages.length + 1, isBot: true, text: upcommingText });
    console.log('messages', messages);

    console.log(upcommingText, 'upcommingText final');
    setUpcommingText('');
  }, [addMessage, messages, upcommingText]);
  useEffect(() => {
    sendMessageListener.on('stream_complete', handleStreamComplete);
    return () => {
      sendMessageListener.off('stream_complete', handleStreamComplete);
    };
  }, [handleStreamComplete]);



  /**
   * 메시지 입력창을 리셋하는 함수
   * @returns 
   */
  const clearMessage = () => {
    return setMessageInput('')
  };



  /**
   * 메시지 디스플레이
   */
  const Message = ({ message }: { message: Message }) => {
    return (
      <div className={message.isBot ? 'bg-gray-300' : 'bg-gray-100'}>
        {message.text}
      </div>
    )
  }



  /**
   * 메인 디스플레이
   */
  return (
    <div id="main">
      <div className="bg-gray-100 flex flex-col h-screen">
        <div className="flex flex-col h-full">
          <div className='p-2 flex gap-1'>
            <button className="btn" onClick={stackMessage} > Test </button>
            <button className='btn btn-primary' onClick={flushMessage}> Flush </button>
          </div>
          <div className="p-4 border-b border-gray-300">
            <div className="text-xl font-bold">Chat with ChatGPT</div>
            <div className="text-gray-500 text-sm">Enter your message below:</div>
          </div>
          <div className="flex-grow p-4 overflow-y-scroll">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {upcommingText !== '' && (
              <div className="bg-gray-100">
                {upcommingText}
              </div>
            )}
          </div>
          <div className="p-4 rounded flex">
            <ClearBtn onClick={clearMessage} />
            <ChatTextArea value={messageInput} setValue={setMessageInput} onSubmit={stackMessage} />
            <ChatSubmitBtn onClick={stackMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};


export default Chat;
