import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { productSchema } from './utils/productSchema';
import { productOrder_schema } from './utils/prodcutOrderSchema';
import { validateOrderSchema } from './utils/validate';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocument.from(client);

const product_table = 'cusecho-adzone-productDB-table';
const productOrder_table = 'cusecho-adzone-productOrderDB-table';

interface Product {
    product_name: string;
    product_id: string;
    product_price: string;
    product_quantity: string;
    product_description: string;
    vendorId?: string;
}
export interface Order {
    orderId: string;
    userId: string;
    products: Array<Product>;
    totalAmount: number;
    orderDate: string;
}
export const placeOrder = async (order: Order): Promise<any> => {
    try {
        const checkInventory = async (products: Array<Product>): Promise<boolean> => {
            // Logic to check if there is sufficient stock for each product

            return true;
        };

        const isInventoryAvailable = await checkInventory(order.products);
        if (!isInventoryAvailable) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Insufficient stock for one or more products',
                }),
            };
        }
        const processPayment = async (userId: string, totalAmount: number): Promise<boolean> => {
            // Logic to process payment
            return true;
        };
        const isPaymentSuccessful = await processPayment(order.userId, order.totalAmount);
        if (!isPaymentSuccessful) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Payment processing failed',
                }),
            };
        }
        await ddbDocClient.put({
            TableName: productOrder_table,
            Item: order,
        });
    } catch (error) {
        console.error('Error placing order:', error);
        throw new Error('Error placing order');
    }
};
export const productOrderHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = event.pathParameters?.id;
    const { totalAmount, products } = JSON.parse(event.body || '{}');

    if (!Array.isArray(products) || products.length === 0 || !Number.isFinite(totalAmount)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Invalid input data',
            }),
        };
    }
    try {
        // Parse the request body and validate against the schema
        const requestBody = JSON.parse(event.body || '{}');
        const validationResult = validateOrderSchema(requestBody, productOrder_schema);

        if (!validationResult.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Invalid input data',
                    details: validationResult.errors,
                }),
            };
        }

        // Destructure the validated data
        const { products, userId, vendorId, orderId, orderDate, totalAmount } = requestBody;

        // Additional processing logic (e.g., inventory check, payment processing) can be added here

        // Create the order object
        const order = {
            products: products,
            userId: userId,
            vendorId: vendorId,
            orderId: orderId,
            orderDate: new Date().toISOString(),
            totalAmount: totalAmount,
        };

        // Place the order
        await placeOrder(order);

        // Return a successful response
        return {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                status: 'OK',
                message: 'Order placed successfully',
                order: order,
            }),
        };
    } catch (error) {
        console.error('An error occurred:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error',
            }),
        };
    }
};
