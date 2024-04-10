import Joi from 'joi';
import Ajv, { ErrorObject, Schema } from 'ajv';

// interface ValidationError {
//     message: string;
//     name: string;
// }

// const ajv = new Ajv({ allErrors: true });

// const Validate = (body: any, schema: Schema): ValidationError[] | true => {
//     const validate = ajv.compile(schema);
//     const valid = validate(body);

//     if (!valid) {
//         const validationErrors: ValidationError[] = (validate.errors || []).map((error: ErrorObject) => {
//             let errorObject: ValidationError = { message: '', name: '' };

//             switch (error.keyword) {
//                 case 'required':
//                     errorObject = {
//                         message: `${error.params.missingProperty} is required.`,
//                         name: error.params.missingProperty,
//                     };
//                     break;
//                 case 'type':
//                     errorObject = {
//                         message: `${error.instancePath.split('/')[1]} ${error.message}.`,
//                         name: error.instancePath.split('/')[1],
//                     };
//                     break;
//                 default:
//                     errorObject = {
//                         message: `${error.instancePath.split('/')[1]} is invalid.`,
//                         name: error.instancePath.split('/')[1],
//                     };
//             }

//             return errorObject;
//         });

//         return validationErrors;
//     }

//     return true;
// };

// export default Validate;

export const vendorSchema = Joi.object({
    vendor_firstName: Joi.string().required(),
    vendor_lastName: Joi.string().required(),
    vendor_phoneNo: Joi.string().required(),
    vendor_address: Joi.string().required(),
    vendor_email: Joi.string().required(),
});

export const couponSchema = Joi.object({
    vendorId: Joi.string().required(),
    coupon_name: Joi.string().required(),
    coupon_code: Joi.string().required(),
    coupon_discount: Joi.number().required(),
    coupon_type: Joi.string().required(),
    validityDate: Joi.string().required(),
});

export const customerSchema = Joi.object({
    customerId: Joi.string().required(),
    customer_firstName: Joi.string().required(),
    customer_lastName: Joi.string().required(),
    customer_phoneNo: Joi.string().required(),
    customer_address: Joi.string().required(),
    customer_email: Joi.string().required(),
});
