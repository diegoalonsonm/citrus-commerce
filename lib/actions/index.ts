"use server"

import { scrapeAmazonProduct } from "../scraper"
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import {getAveragePrice, getHighestPrice, getLowestPrice} from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function ScrapeAndStoreProduct(productUrl: string) {
    if (!productUrl) return

    try {
        connectToDB()

        const scrapedProduct = await scrapeAmazonProduct(productUrl)

        if (!scrapedProduct) return

        let product = scrapedProduct
        const existingProduct = await Product.findOne( { url: scrapedProduct.url } )

        if (existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory, { price: scrapedProduct.currentPrice }
            ]

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory)
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            { upsert: true, new: true }
        )

        revalidatePath(`/products/&{newProduct._id}`)

    } catch (error: any) {
        throw new Error(`Failed to create/update the product: ${error.message}`)
    }
}