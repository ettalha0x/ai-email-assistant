'use client'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
  import { Button } from "@/components/ui/button"
  

  import React from 'react'
import { Pencil } from "lucide-react"
import { EmailLabel } from "@prisma/client"
import EmailEditor from "./email-editor"
import { api } from "@/trpc/react"
import useThreads from "@/hooks/use-threads"
import { toast } from "sonner"
  
  const ComposeButton = () => {

    const [toValues, setToValues] = React.useState<{label:string, value:string}[]>([])      
    const [ccValues, setCcValues] = React.useState<{label:string, value:string}[]>([])      
    const [subject, setSubject] = React.useState<string>('')   

    const { account } = useThreads()
    const sendEmail = api.account.sendEmail.useMutation()
    
    const handleSend = async (value: string) => {
        if (!account) return
        sendEmail.mutate({
                accountId: account.id,
                threadId: undefined,
                body: value,
                from: {name: account.name ?? 'Me' , address: account.email},
                to: toValues.map(to => ({name: to.value, address: to.value})),
                cc: ccValues.map(cc => ({name: cc.value, address: cc.value})),
                replyTo: {name: account.name ?? 'Me' , address: account.email},
                subject: subject,
                inReplyTo: undefined,
            }, {
                onSuccess: () => {
                    toast.success('Email sent')
            },
                onError: (error) => {
                    console.error('Failed to send email', error)
                    toast.error('Failed to send email')
            }
        })
    }
    return (
        <Drawer>
            <DrawerTrigger>
                <Button>
                    <Pencil className="size-4 mr1" />
                    Compose
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Compose email</DrawerTitle>
                </DrawerHeader>
                <EmailEditor
                    toValues={toValues}
                    setToValues={setToValues}
                    ccValues={ccValues}
                    setCcValues={setCcValues}
                    subject={subject}
                    setSubject={setSubject}

                    to={toValues.map(v => v.value)}
                    defaultTooolBarExpanded={true}

                    handleSend={handleSend}
                    isSending={sendEmail.isPending}
                />
            </DrawerContent>
        </Drawer>
      
    )
  }
  
  export default ComposeButton