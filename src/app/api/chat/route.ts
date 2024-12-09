// import { Configuration, OpenAIApi } from "openai-edge";
// import { Message, OpenAIStream, StreamingTextResponse } from "ai";

// import { NextResponse } from "next/server";
// import { OramaClient } from "@/lib/orama";
// import { db } from "@/server/db";
// import { auth } from "@clerk/nextjs/server";

// // export const runtime = "edge";

// const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(config);

// export async function POST(req: Request) {
//     try {
//         const { userId } = await auth()
//         if (!userId) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }
        
//         const { messages, accountId } = await req.json();
//         const oramaClient = new OramaClient(accountId)
//         await oramaClient.initialize()

//         const lastMessage = messages[messages.length - 1]


//         const context = await oramaClient.vectorSearch({ term: lastMessage.content })
//         console.log(context.hits.length + ' hits found')
//         // console.log(context.hits.map(hit => hit.document))

//         const prompt = {
//             role: "system",
//             content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
//             THE TIME NOW IS ${new Date().toLocaleString()}
      
//             START CONTEXT BLOCK
//             ${context.hits.map((hit) => JSON.stringify(hit.document)).join('\n')}
//             END OF CONTEXT BLOCK
            
//             When responding, please keep in mind:
//             - Be helpful, clever, and articulate.
//             - Rely on the provided email context to inform your responses.
//             - If the context does not contain enough information to answer a question, politely say you don't have enough information.
//             - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
//             - Do not invent or speculate about anything that is not directly supported by the email context.
//             - Keep your responses concise and relevant to the user's questions or the email being composed.`
//         };


//         const response = await openai.createChatCompletion({
//             model: "gpt-4o-mini",
//             messages: [
//                 prompt,
//                 ...messages.filter((message: Message) => message.role === "user"),
//             ],
//             stream: true,
//         });
//         const stream = OpenAIStream(response, {
//             onStart: async () => {
//             },
//             onCompletion: async (completion) => {
//                 const today = new Date().toDateString()
//             },
//         });
//         return new StreamingTextResponse(stream);
//     } catch (error) {
//         console.log(error)
//         return NextResponse.json({ error: "error" }, { status: 500 });
//     }
// }