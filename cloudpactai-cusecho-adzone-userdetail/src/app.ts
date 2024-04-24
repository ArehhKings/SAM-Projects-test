import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { customerSchema } from './utils/customerSchema';
import { Productschema } from './utils/productSchema';
import Validate, { validateOrderSchema } from './utils/validate';
import AWS, { APIGateway } from 'aws-sdk';
import { jwtDecode } from 'jwt-decode';
import {
    updatePersonalDetailsSchema,
    updateBillingDetailsSchema,
    updateShippingDetailsSchema,
} from './utils/customerSchema';
import { productOrder_schema } from './utils/prodcutOrderSchema';
import { placeOrder } from './app_productOrder';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocument.from(client);

const customer_table = 'cusecho-adzone-customerDB-table';
const product_table = 'cusecho-adzone-productDB-table';
const productOrder_table = 'cusecho-adzone-productOrderDB-table';

let response: APIGatewayProxyResult;

export const getCustomerHandler = async (event: APIGatewayEvent) => {
    try {
        const id = event.pathParameters?.id;
        if (!id) {
            response = {
                // Use response here
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Missing customerId in path parameters',
                }),
            };
        }
        const data = await ddbDocClient.get({
            TableName: customer_table,
            Key: {
                id: id,
            },
        });
        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Customer not found',
                }),
            };
        }
        response = {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                status: 'OK',
                customer: data.Item,
            }),
        };
        // }
    } catch (error) {
        console.log('an error occurred', error);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                error: error,
            }),
        };
    }
    return response;
};

export const createCustomerHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const {
        error,
        value: {
            firstName,
            lastName,
            phoneNo,
            customer_address,
            email,
            customer_city,
            customer_state,
            bank_account_name,
            bank_accountNo,
            bank,
            shipping_address,
            shipping_city,
            shipping_state,
        },
    } = customerSchema.validate(JSON.parse(event.body || '{}'));

    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.details[0].message }),
        };
    }

    try {
        const data = await ddbDocClient.put({
            TableName: customer_table,
            Item: {
                id: uuidv4(),
                firstName,
                lastName,
                phoneNo,
                customer_city,
                email,
                customer_state,
                customer_address,
                bank_account_name,
                bank_accountNo,
                bank,
                shipping_address,
                shipping_city,
                shipping_state,
            },
        });
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Customer created successfully',
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};

export const updateCustomerHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //const request = JSON.parse(event.body || '{}');
    const body = JSON.parse(event.body || '{}');
    const id = event.pathParameters?.id;
    const queryType = event.queryStringParameters?.update_customer_account_details;

    const personalDetails_UE =
        'set personal_address = :a, personal_city = :b, personal_state = :c, phoneNo = :d, firstName = :e, lastName = :f';
    const shippingDetails_UE = 'set shipping_address = :a, shipping_city = :b, shipping_state =:c';
    const billingDetails_UE = 'set bank= :a, bank_account_name= :b, bank_accountNo= :c';

    const existingUserData = await ddbDocClient.get({
        TableName: customer_table,
        Key: {
            id: id,
        },
    });

    if (!existingUserData.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Customer not found',
            }),
        };
    } else {
        if (queryType === 'personal') {
            try {
                const id = event.pathParameters?.id;
                const valid = Validate(body, updatePersonalDetailsSchema); // check if the request body passed the validation or not
                if (valid !== true) {
                    return {
                        statusCode: 422,
                        body: JSON.stringify({
                            message: 'There are some validation errors on your request',
                            errors: valid,
                        }),
                    };
                }
                const data = await ddbDocClient.update({
                    TableName: customer_table,
                    Key: {
                        id,
                    },

                    UpdateExpression: personalDetails_UE,
                    ExpressionAttributeValues: {
                        ':a': body.personal_address,
                        ':b': body.personal_city,
                        ':c': body.personal_state,
                        ':d': body.phoneNo,
                        ':e': body.firstName,
                        ':f': body.lastName,
                    },
                    ReturnValues: 'UPDATED_NEW',
                });
                response = {
                    statusCode: 200,
                    body: JSON.stringify({
                        statusCode: 200,
                        message: `The customer profile details has been updated successfully!`,
                    }),
                };
            } catch (err) {
                console.log(err);
                response = {
                    statusCode: 500,
                    body: JSON.stringify({
                        statusCode: 500,
                        message: err,
                    }),
                };
                return response;
            }
        }

        if (queryType === 'shipping') {
            try {
                const valid = Validate(body, updateShippingDetailsSchema); // check if the request body passed the validation or not
                if (valid !== true) {
                    return {
                        statusCode: 422,
                        body: JSON.stringify({
                            message: 'There are some validation errors on your request',
                            errors: valid,
                        }),
                    };
                }
                const data = await ddbDocClient.update({
                    TableName: customer_table,
                    Key: {
                        id,
                    },
                    UpdateExpression: shippingDetails_UE,
                    ExpressionAttributeValues: {
                        ':a': body.shipping_address,
                        ':b': body.shipping_city,
                        ':c': body.shipping_state,
                    },
                    ReturnValues: 'UPDATED_NEW',
                });
                response = {
                    statusCode: 200,
                    body: JSON.stringify({
                        statusCode: 200,
                        message: `The customer profile details has been updated successfully!`,
                    }),
                };
            } catch (err) {
                console.log(err);
                response = {
                    statusCode: 500,
                    body: JSON.stringify({
                        statusCode: 500,
                        message: err,
                    }),
                };
                return response;
            }
        }

        if (queryType === 'billing') {
            try {
                const valid = Validate(body, updateBillingDetailsSchema); // check if the request body passed the validation or not
                if (valid !== true) {
                    return {
                        statusCode: 422,
                        body: JSON.stringify({
                            message: 'There are some validation errors on your request',
                            errors: valid,
                        }),
                    };
                }
                const data = await ddbDocClient.update({
                    TableName: customer_table,
                    Key: {
                        id,
                    },
                    UpdateExpression: billingDetails_UE,
                    ExpressionAttributeValues: {
                        ':a': body.bank,
                        ':b': body.bank_account_name,
                        ':c': body.bank_accountNo,
                    },
                    ReturnValues: 'UPDATED_NEW',
                });
                response = {
                    statusCode: 200,
                    body: JSON.stringify({
                        statusCode: 200,
                        message: `The customer profile details has been updated successfully!`,
                    }),
                };
            } catch (err) {
                console.log(err);
                response = {
                    statusCode: 500,
                    body: JSON.stringify({
                        statusCode: 500,
                        message: err,
                    }),
                };
                return response;
            }
        }
    }
    return response;
};
// ================ Products Handlers ================
export const creatProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //to create product
    const {
        error,
        value: { product_name, product_price, product_quantity, product_description, product_image },
    } = Productschema.validate(JSON.parse(event.body || '{}'));

    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.details[0].message }),
        };
    }
    try {
        const data = await ddbDocClient.put({
            TableName: product_table,
            Item: {
                id: uuidv4(),
                product_name,
                product_price,
                product_quantity,
                product_description,
                product_image,
                //vendorId: event.requestContext.authorizer?.jwt.claims.sub,
            },
        });
        console.log('data', data);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Product created successfully',
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error Creating Product' }),
        };
    }
};

export const getSingleProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id;
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Missing productId in path parameters',
                }),
            };
        }
        const data = await ddbDocClient.get({
            TableName: product_table,
            Key: {
                id: id,
            },
        });
        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Product not found',
                }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                status: 'OK',
                product: data.Item,
            }),
        };
    } catch (error) {
        console.log('an error occurred', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error,
            }),
        };
    }
};

export const updateProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || '{}');
        const id = event.pathParameters?.id;

        const product = await ddbDocClient.get({
            TableName: product_table,
            Key: {
                id: id,
            },
        });

        if (!product.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Product not found',
                }),
            };
        }
        const data = await ddbDocClient.update({
            TableName: product_table,
            Key: {
                id: id,
            },
            UpdateExpression:
                'set product_name = :a, product_price = :b, product_quantity = :c, product_description = :d, product_image = :e',
            ExpressionAttributeValues: {
                ':a': body.product_name,
                ':b': body.product_price,
                ':c': body.product_quantity,
                ':d': body.product_description,
                ':e': body.product_image,
            },
            ReturnValues: 'UPDATED_NEW',
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                message: `The product details has been updated successfully!`,
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};

export const deleteProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
    try {
        const product = await ddbDocClient.get({
            TableName: product_table,
            Key: {
                id: id,
            },
        });

        if (!product.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Product not found',
                }),
            };
        }
        const data = await ddbDocClient.delete({
            TableName: product_table,
            Key: {
                id: id,
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                message: `The product has been deleted successfully!`,
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};

// ================ ProductsOrder Handlers ================
export const productOrderHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
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
        console.log('validationResult:::::::::::::::::+++++++222', validationResult);
        if (!validationResult.valid) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Invalid input data',
                    details: validationResult.errors,
                }),
            };
        }
        console.log('validationResult:::::::::::::::::+++++++333', validationResult);
        // Destructure the validated data
        const { products, id, vendorId, totalAmount } = requestBody;

        // Additional processing logic (e.g., inventory check, payment processing) can be added here

        // Create the order object
        const order = {
            products: products,
            userId: id,
            vendorId: vendorId,
            orderId: uuidv4(),
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
