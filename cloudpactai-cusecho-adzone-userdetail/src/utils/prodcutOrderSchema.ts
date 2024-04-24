import Joi from 'joi';

export const productOrder_schema = {
    type: 'object',
    properties: {
        products: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    product_name: { type: 'string' },
                    product_id: { type: 'string' },
                    product_price: { type: 'string' },
                    product_quantity: { type: 'string' },
                    product_description: { type: 'string' },
                    vendorId: { type: 'string', nullable: true },
                },
                required: ['product_name', 'product_id', 'product_price', 'product_quantity'],
            },
        },
        userId: { type: 'string' },
        orderId: { type: 'string' },
        orderDate: { type: 'date' },
        totalAmount: { type: 'number' },
    },
    required: ['products', 'userId', 'vendorId', 'orderId', 'orderDate', 'totalAmount'],
};

export const productOrderSchema = Joi.object({
    products: Joi.array()
        .items(
            Joi.object({
                product_name: Joi.string().required(),
                product_price: Joi.string().required(),
                product_quantity: Joi.string().required(),
                product_description: Joi.string(),
                product_id: Joi.string().required(),
                vendorId: Joi.string(),
            }),
        )
        .required(),
    Id: Joi.string().required(),
    orderId: Joi.string().required(),
    orderDate: Joi.date().required(),
    totalAmount: Joi.number().required(),
});
