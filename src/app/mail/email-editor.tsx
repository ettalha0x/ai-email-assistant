'use client'
import React from 'react'
import StarterKit from '@tiptap/starter-kit'
import {EditorContent, useEditor } from '@tiptap/react'
import { Text } from '@tiptap/extension-text'
import EditorMenuBar from './editor-menubar'
import { Separator } from '@radix-ui/react-select'
import { Button } from '@/components/ui/button'
import TagInput from './tag-input'
import { Input } from '@/components/ui/input'
import AIComposeButton from './ai-compose-button'

type Props = {
    subject: string
    setSubject: (subject: string) => void

    toValues: { label: string, value: string }[]
    setToValues: (values: { label: string, value: string }[]) => void

    ccValues: { label: string, value: string }[]
    setCcValues: (values: { label: string, value: string }[]) => void

    to: string[]

    handleSend: (value: string) => void
    isSending: boolean

    defaultTooolBarExpanded?: boolean
}


const EmailEditor = ({subject, setSubject, toValues, setToValues, ccValues, setCcValues, to, handleSend, isSending, defaultTooolBarExpanded}: Props) => {
    const [value, setValue] = React.useState<string>('')
    const [expanded, setExpanded] = React.useState<boolean>(defaultTooolBarExpanded ?? false)

    const CustomText = Text.extend({
        addKeyboardShortcut() {
            return {
                'Meta-j': () => {
                    console.log('Meta-j')
                    return true
                }
            }
        },
    })

    const editor = useEditor({
        autofocus: true,
        extensions: [StarterKit, CustomText],
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML())
        }
    })

    const onGenerate = (token: string) => {
        editor?.commands?.insertContent(token)
    }

    if (!editor) return null

    return (
        <div>
            <div className='flex p-4 py-2 border-b'>
                <EditorMenuBar editor={editor} />
            </div>
            <div className='p-4 pb-0 space-y-2'>
                {expanded && (
                    <>
                        <TagInput
                            label='To'
                            onChange={setToValues}
                            placeholder='Add recipients'
                            value={toValues}
                        />
                        <TagInput
                            label='Cc'
                            onChange={setCcValues}
                            placeholder='Add recipients'
                            value={ccValues}
                        />
                        <Input id='subject' placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)}></Input>
                    </>
                )}
                <div className='flex items-center gap-2'>
                    <div className='cursor-pointer' onClick={() => setExpanded(!expanded)}>
                        <span className='text-green-600 font-medium'>
                            Draft {" "}
                        </span>
                        <span>
                            to {to.join(', ')}
                        </span>
                    </div>
                    <AIComposeButton isComposing={defaultTooolBarExpanded ?? false} onGenerate={onGenerate}/>
                </div>
            </div>
            <div className='prose w-full px-4'>
                <EditorContent editor={editor} value={value} />
            </div>
            <Separator/>
            <div className='py-3 px-4 flex items0center justify-between'>
                <Button onClick={async () => {
                    editor?.commands?.clearContent()
                    await handleSend(value)
                }} disabled = {isSending}>
                    Send
                </Button>
            </div>
        </div>
    )
}

export default EmailEditor