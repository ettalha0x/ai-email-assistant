import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { Account } from "@/lib/account";
import { syncEmailsToDb } from "@/lib/sync-to-db";

export const POST = async (req: NextRequest) => {
    const { accountId, userId } = await req.json()
    if (!accountId || !userId)
        return NextResponse.json({ message: 'Missing accountId or userId' }, { status: 400 })

    const  dbAccount = await db.account.findUnique({
        where: {
            id: accountId,
            userId: userId
        }
    })
    if (!dbAccount)
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    // trigger initial sync

    const account = new Account(dbAccount.accessToken)

    const response  = await account.performInitialSync()

    if (!response) {
        return NextResponse.json({ message: 'Failed to trigger initial sync' }, { status: 500 })
    }

    const { emails, deltaToken } = response


    await db.account.update({
        where: {
            id: accountId
        },
        data: {
            nextDeltaToken: deltaToken
        }
    })

    await syncEmailsToDb(emails, accountId)

    console.log('sync completed', deltaToken)

    return NextResponse.json({ success: true }, {status: 200})
};