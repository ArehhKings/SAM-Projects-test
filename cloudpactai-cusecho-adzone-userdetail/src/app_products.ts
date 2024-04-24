// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { v4 as uuidv4 } from 'uuid';
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
// import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
// import { schema } from './utils/userSchema';
// import Validate from './utils/validate';
// import AWS, { APIGateway } from 'aws-sdk';
// import { jwtDecode } from 'jwt-decode';

// const client = new DynamoDBClient();
// const ddbDocClient = DynamoDBDocument.from(client);

// const user_table = 'cusecho-adzone-userDB-table';
// const product_table = 'cusecho-adzone-productDB-table';
// const productOrder_table = 'cusecho-adzone-productOrderDB-table';

// let response: APIGatewayProxyResult;

// export const getSingleProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     const id = event.pathParameters?.id;
//     if (!id) {
//         return {
//             statusCode: 400,
//             body: JSON.stringify({
//                 error: 'Missing productId in path parameters',
//             }),
//         };
//     }
//     try {
//         const data = await ddbDocClient.get({
//             TableName: product_table,
//             Key: {
//                 id: id,
//             },
//         });
//         if (!data.Item) {
//             return {
//                 statusCode: 404,
//                 body: JSON.stringify({
//                     error: 'Product not found',
//                 }),
//             };
//         }
//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 statusCode: 200,
//                 status: 'OK',
//                 product: data.Item,
//             }),
//         };
//     } catch (error) {
//         console.log('an error occurred', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({
//                 error: error,
//             }),
//         };
//     }
// };
// export const getAllVendorProductsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     const vendorId = event.pathParameters?.id;
//     if (!vendorId) {
//         return {
//             statusCode: 400,
//             body: JSON.stringify({
//                 error: 'Missing vendorId in path parameters',
//             }),
//         };
//     }
//     try {
//         const data = await ddbDocClient.scan({
//             TableName: product_table,
//             FilterExpression: 'vendorId = :vendorId',
//             ExpressionAttributeValues: {
//                 ':vendorId': vendorId,
//             },
//         });
//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 statusCode: 200,
//                 status: 'OK',
//                 products: data.Items,
//             }),
//         };
//     } catch (error) {
//         console.log('an error occurred', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({
//                 error: error,
//             }),
//         };
//     }
// };
// export const getVendorProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     const vendorId = event.pathParameters?.id;
//     const productId = event.pathParameters?.productId;
//     if (!vendorId) {
//         return {
//             statusCode: 400,
//             body: JSON.stringify({
//                 error: 'Missing vendorId in path parameters',
//             }),
//         };
//     }
//     if (!productId) {
//         return {
//             statusCode: 400,
//             body: JSON.stringify({
//                 error: 'Missing productId in path parameters',
//             }),
//         };
//     }
//     try {
//         const data = await ddbDocClient.get({
//             TableName: product_table,
//             Key: {
//                 id: productId,
//             },
//         });
//         if (!data.Item) {
//             return {
//                 statusCode: 404,
//                 body: JSON.stringify({
//                     error: 'Product not found',
//                 }),
//             };
//         }
//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 statusCode: 200,
//                 status: 'OK',
//                 product: data.Item,
//             }),
//         };
//     } catch (error) {
//         console.log('an error occurred', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({
//                 error: error,
//             }),
//         };
//     }
// };
// export const creatProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     //to create product
//     const {
//         error,
//         value: { product_name, product_price, product_quantity, product_description, product_image },
//     } = schema.validate(JSON.parse(event.body || '{}'));

//     if (error) {
//         return {
//             statusCode: 400,
//             body: JSON.stringify({ error: error.details[0].message }),
//         };
//     }
//     try {
//         const data = await ddbDocClient.put({
//             TableName: product_table,
//             Item: {
//                 product_id: uuidv4(),
//                 product_name,
//                 product_price,
//                 product_quantity,
//                 product_description,
//                 product_image,
//             },
//         });
//         console.log('data', data);

//         return {
//             statusCode: 201,
//             body: JSON.stringify({
//                 message: 'Product created successfully',
//             }),
//         };
//     } catch (error) {
//         console.log(error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: 'Error Creating Product' }),
//         };
//     }
// };

// export const updateProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     const body = JSON.parse(event.body || '{}');
//     const id = event.pathParameters?.id;
//     try {
//         const product = await ddbDocClient.get({
//             TableName: product_table,
//             Key: {
//                 id: id,
//             },
//         });

//         if (!product.Item) {
//             return {
//                 statusCode: 404,
//                 body: JSON.stringify({
//                     error: 'Product not found',
//                 }),
//             };
//         }
//         const data = await ddbDocClient.update({
//             TableName: product_table,
//             Key: {
//                 id: id,
//             },
//             UpdateExpression:
//                 'set product_name = :a, product_id = :b, product_price = :c, product_quantity = :d, product_description = :e, product_image = :f',
//             ExpressionAttributeValues: {
//                 ':a': body.product_name,
//                 ':b': body.product_id,
//                 ':c': body.product_price,
//                 ':d': body.product_quantity,
//                 ':e': body.product_description,
//                 ':f': body.product_image,
//             },
//             ReturnValues: 'UPDATED_NEW',
//         });

//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 statusCode: 200,
//                 message: `The product details has been updated successfully!`,
//             }),
//         };
//     } catch (err) {
//         console.log(err);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: 'Internal Server Error' }),
//         };
//     }
// };

// export const deleteProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     const id = event.pathParameters?.id;
//     try {
//         const product = await ddbDocClient.get({
//             TableName: product_table,
//             Key: {
//                 id: id,
//             },
//         });

//         if (!product.Item) {
//             return {
//                 statusCode: 404,
//                 body: JSON.stringify({
//                     error: 'Product not found',
//                 }),
//             };
//         }
//         const data = await ddbDocClient.delete({
//             TableName: product_table,
//             Key: {
//                 id: id,
//             },
//         });

//         return {
//             statusCode: 200,
//             body: JSON.stringify({
//                 statusCode: 200,
//                 message: `The product has been deleted successfully!`,
//             }),
//         };
//     } catch (err) {
//         console.log(err);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: 'Internal Server Error' }),
//         };
//     }
// };
