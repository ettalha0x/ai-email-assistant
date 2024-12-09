'use server'

import {streamText } from 'ai'
import { openai } from'@ai-sdk/openai'
import { createStreamableValue } from 'ai/rsc'

export  async function generateEmail(context: string, prompt: string) {
    const stream = createStreamableValue('');
    (async () => {
        const { textStream } = await streamText({
            model: openai('gpt-4o-mini'),
            prompt: `
                You are an AI email  assistant embedded in an email client app . Your purpose is to help users compose emails. You have access to the user's email context and the user prompt. You should generate an email response based on the user prompt and the email context.
                
                THE TIME NOW IS ${new Date().toLocaleTimeString()}

                START OF CONTEXT BLOCK
                ${context}
                END OF CONTEXT BLOCK

                USER PROMPT: ${prompt}

                Whene responding, please keep in mind the following context:
                    - Be helpful and informative
                    - Be professional
                    - Rely on the provided email context to inform your response
                    - If the context is insufficient, please ask for more information.
                    - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on the new information.
                    - Do not inventor speculate about anything that is not directly supported by the email context.
                    - Keep your response focused and relevant to the user prompt.
                    - Do not add fluff like 'here is your email' or anything similar.
                    - Directly outpout the email, no need to say 'here is your email' or anything similar.
                    - No need to outpout the subject line, just the email body.
            `,
        });

        for await (const token of textStream) {
            stream.update(token);
        }

        stream.done();
    })()

    return {output: stream.value}
    // return {output: "Hi there, I'm an AI email assistant. How can I help you today?"}
    
}