import React from 'react'
import { searchValueAtom } from './search-bar'
import { useAtom } from 'jotai'
import { useDebounceValue } from 'usehooks-ts'
import { api } from '@/trpc/react'
import useThreads from '@/hooks/use-threads'
import DOMPurify from 'dompurify'

const SearchDisplay = () => {
    const [searchValue] = useAtom(searchValueAtom) 
    const search = api.account.searchEmails.useMutation()

    const [debouncedSearchValue] = useDebounceValue(searchValue, 500)
    const { accountId } = useThreads()

    React.useEffect(() => {
        if (!accountId) return
        search.mutate({
            accountId,
            query: debouncedSearchValue
        })
    }, [debouncedSearchValue, accountId])
    return (
    <div className='p-4 max-h-[calc(100vh-50px)] overflow-y-scroll'>
        <div className='flex items-center gap-2 mb-4'>
            <h2 className='text-gray-600 text-sm dark:text-gray-400'>
                Your search for &quot;{searchValue}&quot; come back with...
            </h2>
        </div>
        {search.data?.hits.length === 0 ? <>
            <p>No results found</p>
        </> : <>
            {search.data?.hits.map(hit => (
                <ul className='flex flex-col gap-2'>
                    <li key={hit.id} className='border list-none rounded-md p-4 mt-2 hover:bg-gray-100 cursor-pointer transition-all dark:hover:bg-gray-900'>
                        <h3 className='text-base font-medium'>
                            {hit.document.subject}
                        </h3>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {hit.document.from}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {hit.document.to.join(', ')}
                        </p>
                        <p className='text-sm mt-2' dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(hit.document.rawBody, {USE_PROFILES: {html: true}})
                        }}>
                        </p>
                    </li>
                </ul>
            ))}
        </>}
    </div>
    )
}

export default SearchDisplay