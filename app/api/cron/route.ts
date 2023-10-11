import {connectToDB} from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import {scrapeAmazonProduct} from "@/lib/scraper";
import {getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice} from "@/lib/utils";
import {generateEmailBody, sendEmail} from "@/lib/nodemailer";
import {NextResponse} from "next/server";

export const maxDuration = 10
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(){
    try {
        connectToDB()

        const products = await Product.find({})

        if (!products) throw new Error('No products found')

        // cron functions
        // 1. scrape products and update db
        const updatedProducts = await Promise.all(
            products.map(async (currenProduct) => {
                const scrapedProduct = await scrapeAmazonProduct(currenProduct.url)
                if (!scrapedProduct) throw new Error("Failed to scrape the product")

                const updatedPriceHistory = [
                    ...currenProduct.priceHistory,
                    {price: scrapedProduct.currentPrice}
                ]

                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory)
                }

                const updatedProduct = await Product.findOneAndUpdate(
                    { url: product.url },
                    product
                )

                // 2. check the product status and send email
                const emailNotificationType = getEmailNotifType(scrapedProduct, currenProduct)
                if(emailNotificationType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url
                    }

                    const emailContent = await generateEmailBody(productInfo, emailNotificationType)

                    const userEmails = updatedProduct.users.map((user: any) => user.email)

                    await sendEmail(emailContent, userEmails)
                }
                return updatedProduct
            })
        )

    return NextResponse.json({
        message: 'Ok', data: updatedProducts
    })
    } catch (error) {
        throw new Error(`Error in GET: ${error}`);
    }
}