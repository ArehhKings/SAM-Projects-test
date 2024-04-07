import joi from "joi";

export const userSchema = joi.object({
  firstName: joi.string().min(3).max(30).required(),
  lastName: joi.string().min(3).max(30).required(),
  phoneNo: joi.string().min(10).max(15).required(),
  address: joi.string().required(),
  city: joi.string().required(),
  state: joi.string().required(),
  bank_account_name: joi.string().required(),
  bank_accountNo: joi.string().required(),
  bank: joi.string().required(),
  shipping_address: joi.string().required(),
  shipping_city: joi.string().required(),
  shipping_state: joi.string().required(),
});
