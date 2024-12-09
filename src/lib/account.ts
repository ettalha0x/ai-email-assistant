import { db } from "@/server/db";
import { EmailAddress, SyncResponse, SyncUpdatedResponse } from "@/types";
import axios from "axios";
import { syncEmailsToDb } from "./sync-to-db";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

   private async startSync() {
        // trigger initial sync
        const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
            headers: { 
                Authorization: `Bearer ${this.token}`
            },
            params: {
                daysWithin: 365, // sync emails within the last 30 days
                bodyType: 'html' // sync emails with HTML body
            }
        })
        return response.data
   }

   async getUpdatedEmails({deltaToken, pageToken}: {deltaToken?: string, pageToken?: string}) {
        let params: Record<string, string> = {}
        if (deltaToken) params.deltaToken = deltaToken
        if (pageToken) params.pageToken = pageToken

        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers: { 
                Authorization: `Bearer ${this.token}`
            },
            params
        })
        return response.data
   }

   async performInitialSync() {

        try {
            let syncResponse = await this.startSync()
            while (!syncResponse.ready) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                syncResponse = await this.startSync()
            }
            let storedDeltaToken: string = syncResponse.syncUpdatedToken

            let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken})

            if (updatedResponse.nextDeltaToken) {
                // syc has completed
                storedDeltaToken = updatedResponse.nextDeltaToken
            }

            let allEmails = updatedResponse.records

            // fetch all pages  if there are more

            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken, pageToken: updatedResponse.nextPageToken})
                allEmails = allEmails.concat(updatedResponse.records)
                if (updatedResponse.nextDeltaToken) {
                    storedDeltaToken = updatedResponse.nextDeltaToken
                }
            }
            console.log('initial sync completed, we have', allEmails.length, 'emails')

            // store the latest delta token for future syncs

            return {
                emails: allEmails,
                deltaToken: storedDeltaToken
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error during initial sync', JSON.stringify(error.response?.data, null, 2))
            } else {
                console.error('Error during initial sync', error)
            }
        }
    }
    
    async syncEmails() {
        const account = await db.account.findUnique({
            where: {
                accessToken: this.token
            }
        })
        if (!account) {
            throw new Error('Account not found')
        }
        if (!account.nextDeltaToken) {
            throw new Error('Account has not been synced')
        }

        let response = await this.getUpdatedEmails({
            deltaToken: account.nextDeltaToken
        })

        let storedDeltaToken = account.nextDeltaToken
        let allEmails = response.records

        if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken
        }

        while (response.nextPageToken) {
            response = await this.getUpdatedEmails({deltaToken: storedDeltaToken, pageToken: response.nextPageToken})
            allEmails = allEmails.concat(response.records)
            if (response.nextDeltaToken) {
                storedDeltaToken = response.nextDeltaToken
            }
        }

        try {
            syncEmailsToDb(allEmails, account.id)
        } catch (error) {
            console.error('Error syncing emails to db', error)
        }

        await db.account.update({
            where: {
                id: account.id
            },
            data: {
                nextDeltaToken: storedDeltaToken
            }
        })

        return {
            emails: allEmails,
            deltaToken: storedDeltaToken
        }

    }

    async sendEmail({
        from,
        subject,
        body,
        inReplyTo,
        references,
        threadId,
        to,
        cc,
        bcc,
        replyTo,
    }: {
        from: EmailAddress;
        subject: string;
        body: string;
        inReplyTo?: string;
        references?: string;
        threadId?: string;
        to: EmailAddress[];
        cc?: EmailAddress[];
        bcc?: EmailAddress[];
        replyTo?: EmailAddress;
    }) {
        try {
            const response = await axios.post('https://api.aurinko.io/v1/email/messages',
                {
                    from,
                    subject,
                    body,
                    inReplyTo,
                    references,
                    threadId,
                    to,
                    cc,
                    bcc,
                    replyTo: [replyTo],
                },
                {
                    params: {
                        returnIds: true
                    },
                    headers: { Authorization: `Bearer ${this.token}` }
                }
            );

            console.log('sendmail', response.data)
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(' Error sending email:', JSON.stringify(error.response?.data, null, 2));
            } else {
                console.error('Error sending email:', error);
            }
            throw error;
        }
    }
}