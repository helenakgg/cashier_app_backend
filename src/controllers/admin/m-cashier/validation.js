import * as Yup from "yup"
import YupPassword from 'yup-password';
YupPassword(Yup);

export const CreateCashierValidationSchema = Yup.object({
    username : Yup.string().required("Username is required"),
    password : Yup.string().required("Password is required"),
    email : Yup.string().email("Invalid email").required("Email is required"),
})

export const changeUsernameSchema = Yup.object().shape({
    username : Yup.string()
    .min(5,'Username minimum 5 characters'),
});

export const changePasswordSchema = Yup.object({
    newPassword: Yup.string()
      .required("Password is required")
      .notOneOf([Yup.ref('currentPassword')],"New and Current Password can't be the same")
      .min(6, 'password must contain 6 or more characters with at least one of each: uppercase, special character')
      .minUppercase(1, 'password must contain at least 1 upper case letter')
      .minSymbols(1, 'password must contain at least 1 special character'),
    confirmPassword: Yup.string()
      .required("Password is required")
      .oneOf([Yup.ref('newPassword'), null], 'Must match "New Password" field value'),
});

export const verifyToChangeEmailSchema = Yup.object({
    password: Yup.string().required("Password is required")
})

export const changeEmailSchema = Yup.object({
    newEmail : Yup.string().email("Invalid email").required("New Email is required")
  })