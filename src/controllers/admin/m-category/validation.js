import * as Yup from "yup"

export const AddCategorySchema = Yup.object({
    categoryName : Yup.string().required("Category is required")
})

export const EditCategorySchema = Yup.object({
    categoryName : Yup.string().required("Category is required")
})