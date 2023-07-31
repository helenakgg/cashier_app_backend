import * as Yup from "yup"
import YupPassword from 'yup-password';
YupPassword(Yup);

export const RegisterValidationSchema = Yup.object({
    username : Yup.string().required("Username is required"),
    password : Yup.string().required("Password is required"),
    email : Yup.string().email("Invalid email").required("Email is required"),
})

export const LoginValidationSchema = Yup.object({
    username : Yup.string().required("Username is required"),
    password : Yup.string().required("Password is required")
})

export const EmailValidationSchema = Yup.object({
    email : Yup.string().email("Invalid email").required("Email is required")
})

export const IsEmail = async (email) => {
    return await EmailValidationSchema.isValid({ email })
}

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("Password is required")
    .min(6, 'password must contain 6 or more characters with at least one of each: uppercase, special character')
    .minUppercase(1, 'password must contain at least 1 upper case letter')
    .minSymbols(1, 'password must contain at least 1 special character'),
  confirmPassword: Yup.string()
    .required("Password is required")
    .oneOf([Yup.ref('newPassword'), null], 'Must match "New Password" field value'),
});
  
  
  