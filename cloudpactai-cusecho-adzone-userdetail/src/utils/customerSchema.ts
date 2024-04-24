import Joi from 'joi';

export const customerSchema = Joi.object({
    firstName: Joi.string().max(25).required(),
    lastName: Joi.string().required(),
    phoneNo: Joi.string().required(),
    email: Joi.string().email().required(),
    customer_address: Joi.string().required(),
    customer_city: Joi.string().required(),
    customer_state: Joi.string().required(),
    bank_account_name: Joi.string(),
    bank_accountNo: Joi.string(),
    bank: Joi.string(),
    shipping_address: Joi.string(),
    shipping_city: Joi.string(),
    shipping_state: Joi.string(),
});

export const updateShippingDetailsSchema = {
    type: 'object',
    properties: {
        shipping_address: {
            type: 'string',
        },
        shipping_city: {
            type: 'string',
        },
        shipping_state: {
            type: 'string',
        },
    },
    // Field inside the required array is required otherwise optional
    required: ['shipping_address', 'shipping_city', 'shipping_state'],
};

export const updateBillingDetailsSchema = {
    type: 'object',
    properties: {
        bank: {
            type: 'string',
        },
        bank_account_name: {
            type: 'string',
        },
        bank_accountNo: {
            type: 'string',
        },
    },
    // Field inside the required array is required otherwise optional
    required: ['bank', 'bank_account_name', 'bank_accountNo'],
};

export const updatePersonalDetailsSchema = {
    type: 'object',
    properties: {
        customer_address: {
            type: 'string',
        },
        customer_city: {
            type: 'string',
        },
        customer_state: {
            type: 'string',
        },
        phoneNo: {
            type: 'string',
        },
        firstNamme: {
            type: 'string',
        },
        lastName: {
            type: 'string',
        },
    },
    // Field inside the required array is required otherwise optional
    required: ['firstName', 'lastName', 'phoneNo', 'customer_address', 'customer_city', 'customer_state'],
};
