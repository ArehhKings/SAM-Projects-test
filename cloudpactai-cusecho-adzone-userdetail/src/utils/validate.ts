import Ajv, { ErrorObject, Schema } from 'ajv';

interface ValidationError {
    message: string;
    name: string;
}

const ajv = new Ajv({ allErrors: true });

const Validate = (body: any, schema: Schema): ValidationError[] | true => {
    const validate = ajv.compile(schema);
    const valid = validate(body);

    if (!valid) {
        const validationErrors: ValidationError[] = (validate.errors || []).map((error: ErrorObject) => {
            let errorObject: ValidationError = { message: '', name: '' };

            switch (error.keyword) {
                case 'required':
                    errorObject = {
                        message: `${error.params.missingProperty} is required.`,
                        name: error.params.missingProperty,
                    };
                    break;
                case 'type':
                    errorObject = {
                        message: `${error.instancePath.split('/')[1]} ${error.message}.`,
                        name: error.instancePath.split('/')[1],
                    };
                    break;
                default:
                    errorObject = {
                        message: `${error.instancePath.split('/')[1]} is invalid.`,
                        name: error.instancePath.split('/')[1],
                    };
            }

            return errorObject;
        });

        return validationErrors;
    }

    return true;
};

export default Validate;

export const validateOrderSchema = (data: any, schema: Schema): { valid: boolean; errors?: any[] } => {
    // Perform validation using your preferred validation library or custom logic
    // For simplicity, let's assume a basic validation using JSON schema
    const Ajv = require('ajv');
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(data);

    return {
        valid: valid,
        errors: valid ? undefined : validate.errors,
    };
};
