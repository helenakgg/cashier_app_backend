import * as Yup from "yup"

export const CreateProductSchema = Yup.object({
    productName : Yup.string().required("Product Name is required"),
    price       : Yup.number()
                    .required("Price is required")
                    .positive("Price must be a positive number")
                    .integer("Price must be an integer"),
    description : Yup.string().required("Description is required"),
    categoryId  : Yup.number().required("categoryId is required")
})

export const UpdateProductSchema = Yup.object({
    price       : Yup.number()
                    .positive("Price must be a positive number")
                    .integer("Price must be an integer")
})
