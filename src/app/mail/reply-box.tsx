'use client'

import React from 'react'
import EmailEditor from './email-editor'
import useThreads from '@/hooks/use-threads'
import { RouterOutputs, api } from '@/trpc/react'
import { toast } from 'sonner'

const ReplyBox = () => {
  const {threadId, accountId} = useThreads()
  const {data: replyDetails} = api.account.getReplyDetails.useQuery({
    threadId: threadId ?? "",
    accountId,
  })

  if (!replyDetails) return null

  return <Component replyDetails={replyDetails} />
}

const Component = ({replyDetails}: {replyDetails: RouterOutputs['account']['getReplyDetails']}) => {
  const {threadId, accountId} = useThreads()

  const [subject, setSubject] = React.useState(replyDetails.subject.startsWith('Re: ') ? replyDetails.subject : `Re: ${replyDetails.subject}`)
  const [toValues, setToValues] = React.useState(replyDetails.to.map(to => ({label: to.address, value: to.address})))
  const [ccValues, setCcValues] = React.useState(replyDetails.cc.map(cc => ({label: cc.address, value: cc.address})))

  React.useEffect(() => {
    if (!threadId || !replyDetails) return

    if (!replyDetails.subject.startsWith('Re: ')) {
      setSubject(`Re: ${replyDetails.subject}`)
    } else {
      setSubject(replyDetails.subject)
    }

  }, [threadId, replyDetails])

  const sendEmail = api.account.sendEmail.useMutation()

  const handleSend = async (value: string) => {
    if (!replyDetails) return

    sendEmail.mutate({
      accountId,
      threadId: threadId ?? undefined,
      body: value,
      subject,
      from: replyDetails.from,
      to: replyDetails.to.map(to => ({address: to.address, name: to.name ?? ''})),
      cc: replyDetails.cc.map(cc => ({address: cc.address, name: cc.name ?? ''})),
      replyTo: replyDetails.from,
      inReplyTo: replyDetails.id,
    }, {
      onSuccess: () => {
        toast.success('Email sent!')
      },
      onError: (error) => {
        console.log(error)
        toast.error('Failed to send email')
      }
    })
  }

  return (
    <EmailEditor
      subject={subject}
      setSubject={setSubject}

      toValues={toValues}
      setToValues={setToValues}

      ccValues={ccValues}
      setCcValues={setCcValues}

      to={replyDetails.to.map(to => to.address)}

      isSending={sendEmail.isPending}
      handleSend={handleSend}
    />
  )
}
export default ReplyBox