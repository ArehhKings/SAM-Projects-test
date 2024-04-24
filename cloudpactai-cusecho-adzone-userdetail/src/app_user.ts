import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Userschema } from './utils/userSchema';
import Validate from './utils/validate';
import AWS, { APIGateway } from 'aws-sdk';
import { jwtDecode } from 'jwt-decode';
import {
    updatePersonalDetailsSchema,
    updateBillingDetailsSchema,
    updateShippingDetailsSchema,
} from './utils/userSchema';
import { productSchema } from './utils/productSchema';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocument.from(client);

const user_table = 'cusecho-adzone-userDB-table';
const product_table = 'cusecho-adzone-productDB-table';
const productOrder_table = 'cusecho-adzone-productOrderDB-table';

let response: APIGatewayProxyResult;

export const getUserHandler = async (event: APIGatewayEvent) => {
    try {
        const id = event.pathParameters?.id;
        if (!id) {
            response = {
                // Use response here
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Missing userId in path parameters',
                }),
            };
        }
        const data = await ddbDocClient.get({
            TableName: user_table,
            Key: {
                id: id,
            },
        });
        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'User not found',
                }),
            };
        }
        response = {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                status: 'OK',
                user: data.Item,
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

export const createUserHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const {
        error,
        value: {
            firstName,
            lastName,
            phoneNo,
            address,
            email,
            city,
            state,
            bank_account_name,
            bank_accountNo,
            bank,
            shipping_address,
            shipping_city,
            shipping_state,
        },
    } = Userschema.validate(JSON.parse(event.body || '{}'));

    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.details[0].message }),
        };
    }

    try {
        const data = await ddbDocClient.put({
            TableName: user_table,
            Item: {
                id: uuidv4(),
                firstName,
                lastName,
                phoneNo,
                city,
                email,
                state,
                address,
                bank_account_name,
                bank_accountNo,
                bank,
                shipping_address,
                shipping_city,
                shipping_state,
            },
        });
        console.log('data', data);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'User created successfully',
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

export const updateUserHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //const request = JSON.parse(event.body || '{}');
    const body = JSON.parse(event.body || '{}');
    const id = event.pathParameters?.id;
    const queryType = event.queryStringParameters?.update_user_account_details;

    const personalDetails_UE =
        'set personal_address = :a, personal_city = :b, personal_state = :c, phoneNo = :d, firstName = :e, lastName = :f';
    const shippingDetails_UE = 'set shipping_address = :a, shipping_city = :b, shipping_state =:c';
    const billingDetails_UE = 'set bank= :a, bank_account_name= :b, bank_accountNo= :c';

    const existingUserData = await ddbDocClient.get({
        TableName: user_table,
        Key: {
            id: id,
        },
    });

    if (!existingUserData.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'User not found',
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
                    TableName: user_table,
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
                        message: `The user profile details has been updated successfully!`,
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
                    TableName: user_table,
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
                        message: `The user profile details has been updated successfully!`,
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
                    TableName: user_table,
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
                        message: `The user profile details has been updated successfully!`,
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
