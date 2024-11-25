import { db } from "./server/db"

await db.user.create({
    data: {
        email: "test@mail.com",
        name: "Nour ettalha",
    }
})
console.log('done')