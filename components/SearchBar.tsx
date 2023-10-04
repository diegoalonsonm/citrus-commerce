"use client"

import { ScrapeAndStoreProduct } from "@/lib/actions"
import { FormEvent, useState } from "react"

const isValidProductUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url)
        const hostname = parsedUrl.hostname

        if (hostname.includes('amazon.com') || hostname.includes('amazon.') || 
            hostname.endsWith('amazon') ) {
            return true
        }

    } catch (error) {
        return false
    }
    return false
}

export const SearchBar = () => {
    const [searchPrompt, setSearchPrompt] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const isValidLink = isValidProductUrl(searchPrompt)

        if (!isValidLink) {
            alert('Please provide a valid Amazon link')
            return
        }

        try {
            setIsLoading(true)

            //scrape product
            const product = await ScrapeAndStoreProduct(searchPrompt)

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
            <input type='text' 
                value={searchPrompt} onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Enter Amazon product link" className="searchbar-input" 
            />
            <button type='submit' className='searchbar-btn' disabled= {searchPrompt === ''}>
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    )
}