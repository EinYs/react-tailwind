import EventEmitter from 'events';
const messageEmitter = new EventEmitter();

export interface Message {
  id: number;
  isBot: boolean;
  text: string;
}

export const sendMessage = async (messageQueue: Message[]) => {
  // Call backend API to get ChatGPT response
  const myPrompt = messageQueue.map(m => m.text).join('\n');

  const chatStream = (prompt: string) => {
    return fetch('https://api.openai.com/v1/chat/completions', {
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": prompt }],
        stream: true
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` }

    })
  }

  const rb = (await chatStream(myPrompt)).body
  const reader = rb?.getReader()

  // read() returns a promise that resolves
  // when a value has been received
  reader?.read().then(function processText({ done, value }): any {
    // Result objects contain two properties:
    // done  - true if the stream has already given you all its data.
    // value - some data. Always undefined when done is true.
    if (done) {
      messageEmitter.emit('stream_complete');
      return;
    }

    interface ChatCompletionChunk {
      id: string;
      object: string;
      created: number;
      model: string;
      choices: {
        delta: {
          role?: string,
          content?: string;
        };
        index: number;
        finish_reason: string | null;
      }[];
    }

    // 데이터 청크를 가져옴
    const chunk = value;
    // 데이터 청크를 문자열로 디코딩
    let chunkString = new TextDecoder().decode(chunk);
    // JSON 객체가 포함된 문자열을 추출하기 위한 정규식
    const regex = /^data:\s*(\{.+?\})\s*$/gm
    // 정규식을 사용하여 JSON 객체 추출 후, JavaScript 객체로 변환
    let match = chunkString.match(regex);

    const jsonList: ChatCompletionChunk[] | undefined = chunkString.match(regex)?.map(jsonStr => { try { return JSON.parse(jsonStr.slice(5)) } catch (e) { console.log(e, jsonStr.slice(5)) } });
    if (!jsonList) {
      return reader.read().then(processText); // 확인된 JSON 객체가 없는 경우, 다음 데이터 청크(chunk)를 읽어서 처리
    }

    console.log(jsonList, 'jsonList')

    jsonList.forEach((e) => {
      if (e && e.choices) {

        const chunkContent = e.choices[0].delta?.content
        chunkContent ? messageEmitter.emit('chunk_received', chunkContent) : console.log('no content chunk')
        // console.log(upcommingText, e)
      }
    })

    // Read some more, and call this function again
    return reader.read().then(processText);
  });
}

export default messageEmitter