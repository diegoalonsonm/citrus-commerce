import axios from 'axios'
import * as cheerio from 'cheerio'
import { extractCurrency, extractPrice } from '../utils'

export async function scrapeAmazonProduct (url: string){
    if (!url) return

    //brigthdata config
    const username = String(process.env.BRIGHTDATA_USERNAME)
    const password = String(process.env.BRIGHTDATA_PASSWORD)
    const port = 22225
    const session_id = (1000000 * Math.random()) | 0
    
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        //fetch products
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data)

        //extract product info
        const title = $('#productTitle').text().trim()
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            //$('.a-price.a-text-price.a-size-medium.apexPriceToPay')
        )
            
        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        )

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 
            'Currently unavailable.'

        const image = $('#imgBlkFront').attr('data-a-dynamic-image') || 
            $('#landingImage').attr('data-a-dynamic-image') || '{}'

        const imgUrls = Object.keys(JSON.parse(image))
        const currency = extractCurrency($('.a-price-symbol'))
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '')
        const brand = $('tr.a-spacing-small.po-brand td.a-span9 span.a-size-base.po-break-word').text().trim() || 'Check the website for better results'
        const deliveryDate = $('#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE span span.a-text-bold').text().trim() || 'Check the website for better results'

        //console.log({title, currentPrice, originalPrice, outOfStock, imgUrls, currency, discountRate, brand, deliveryDate})

        //data object with scraped info
        const data = {
            url, 
            currency: currency || '$',
            image: imgUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            outOfStock: outOfStock,
            priceHistory: [],
            discountRate: Number(discountRate), 
            brand,
            deliveryDate,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice)
        }

        return data

    } catch (error: any) {
        throw new Error(`Failed to scrape the product: ${error.message}`)
    }
}