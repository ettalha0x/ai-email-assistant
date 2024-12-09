import {create, insert, search, type AnyOrama } from '@orama/orama'
import { db } from './server/db'
import { OramaClient } from './lib/orama'
import { turndown } from './lib/turndown'
import { getEmbeddings } from './lib/embedding'

const orama = new OramaClient("83618")
await orama.initialize()


// const emails = await db.email.findMany({
//     select: {
//         subject: true,
//         body: true,
//         from: true,
//         to: true,
//         sentAt: true,
//         threadId: true,
//         bodySnippet: true,
//     }
// })

// for (const email of emails) {
// // await Promise.all(emails.map(async (email) => {
//    const body = turndown.turndown(email.body ?? email.bodySnippet ?? "")
//    const embeddings = await getEmbeddings(body)
//    console.log(embeddings.length)

//    //@ts-ignore
//    await orama.insert({
//         subject: email.subject,
//         body: body,
//         rawBody: email.bodySnippet ?? "",
//         from: email.from.address,
//         to: email.to.map((to) => to.address),
//         sentAt: email.sentAt.toLocaleString(),
//         threadId: email.threadId,
//         embeddings: embeddings
//     })
// }
// // ))

await orama.saveIndex()

const searchResults = await orama.vectorSearch({
    term: "IFBB",
})

for (const hit of searchResults.hits) {
    console.log(hit.document.subject)
}
