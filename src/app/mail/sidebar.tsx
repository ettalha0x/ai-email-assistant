'use client'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { Nav } from './nav'
import { Inbox , File, Send} from 'lucide-react'
import { api } from '@/trpc/react'

type Props = { isCollapsed: boolean }

const Sidebar = ({isCollapsed}: Props) => {
    
    const [accountId] = useLocalStorage('accountId', '')
    const [tab] = useLocalStorage('ai-email-saas-tab', 'inbox')

    const { data: inboxThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'inbox',
    })
    const { data: draftsThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'drafts',
    })
    const { data: sentThreads } = api.account.getNumThreads.useQuery({
        accountId,
        tab: 'sent',
    })

    return (
        <Nav 
            isCollapsed={isCollapsed}
            links={
            [
                {
                    title: 'Inbox',
                    label: inboxThreads?.toString() ?? '0',
                    icon: Inbox,
                    variant: tab === 'inbox' ? 'default' : 'ghost'
                },
                {
                    title: 'Drafts',
                    label: draftsThreads?.toString() ?? '0',
                    icon: File,
                    variant: tab === 'drafts' ? 'default' : 'ghost'
                },
                {
                    title: 'Sent',
                    label: sentThreads?.toString() ?? '0',
                    icon: Send,
                    variant: tab === 'sent' ? 'default' : 'ghost'
                },
            ]
            }
        >
        </Nav>
    )
}

export default Sidebar