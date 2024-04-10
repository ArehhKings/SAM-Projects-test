import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { vendorSchema } from './schemas';
import { couponSchema } from './schemas';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocument.from(client);
let response: APIGatewayProxyResult;

export const createVendorHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const {
        error,
        value: { vendor_firstName, vendor_lastName, vendor_phoneNo, vendor_address, vendor_email },
    } = vendorSchema.validate(JSON.parse(event.body || '{}'));
    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.details[0].message }),
        };
    }
    try {
        const data = await ddbDocClient.put({
            TableName: 'VendorDB',
            Item: {
                id: uuidv4(),
                vendor_firstName,
                vendor_lastName,
                vendor_email,
                vendor_phoneNo,
                vendor_address,
            },
        });

        response = {
            statusCode: 201,
            body: JSON.stringify({
                statusCode: 201,
                message: 'Vendor is created successfully',
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Something went wrong',
            }),
        };
    }
    return response;
};

export const createCouponHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const {
        error,
        value: { coupon_name, coupon_code, coupon_discount, coupon_type, validityDate },
    } = couponSchema.validate(JSON.parse(event.body || '{}'));
    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.details[0].message }),
        };
    }
    try {
        const data = await ddbDocClient.put({
            TableName: 'CouponDB',
            Item: {
                vendorId: 1234,
                id: uuidv4(),
                coupon_name,
                coupon_code,
                coupon_discount,
                coupon_type,
                createdAt: new Date().toISOString(),
                validityDate,
            },
        });

        response = {
            statusCode: 201,
            body: JSON.stringify({
                statusCode: 201,
                message: 'Coupon is created successfully',
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'An error has occurred',
            }),
        };
    }
    return response;
};
