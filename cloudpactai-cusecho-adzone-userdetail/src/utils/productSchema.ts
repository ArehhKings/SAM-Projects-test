import Joi from 'joi';

export const productSchema = {
    type: 'object',
    properties: {
        product_name: {
            type: 'string',
        },
        product_id: {
            type: 'string',
        },
        product_price: {
            type: 'string',
        },
        product_quantity: {
            type: 'string',
        },
        product_description: {
            type: 'string',
        },
        product_image: {
            type: 'string',
        },
        vendorId: {
            type: 'string',
            allowNull: true,
        },
    },
    required: [
        'product_name',
        'product_id',
        'product_price',
        'product_quantity',
        'product_image',
        'product_description',
        // "vendorId"
    ],
};

export const Productschema = Joi.object({
    product_name: Joi.string().required(),
    product_price: Joi.string().required(),
    product_quantity: Joi.string().required(),
    product_description: Joi.string().required(),
    product_image: Joi.string().required(),
    product_id: Joi.string().required(),
    vendorId: Joi.string(),
});
