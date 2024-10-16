import { object, number, string, TypeOf, optional } from "zod";
import { z } from "zod";

/**
 * @openapi
 * components:
 *   schema:
 *     Product:
 *       type: object
 *       required:
 *        - title
 *        - description
 *        - price
 *        - image
 *       properties:
 *         title:
 *           type: string
 *           default: "Canon EOS 1500D DSLR Camera with 18-55mm Lens"
 *         description:
 *           type: string
 *           default: "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go."
 *         price:
 *           type: number
 *           default: 879.99
 *         image:
 *           type: string
 *           default: "https://i.imgur.com/QlRphfQ.jpg"
 *     productResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         image:
 *           type: string
 *         productId:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         __v:
 *           type: number
 *
 */

const payload = {
  body: object({
    title: string({
      required_error: "Title is required",
    }),
    description: string({
      required_error: "Description is required",
    }).min(120, "Description should be at least 120 characters long"),
    price: number({
      required_error: "Price is required",
    }),
    image: string({
      required_error: "Image is required",
    }),
  }),
};

const params = {
  params: object({
    productId: string({
      required_error: "productId is required",
    }),
  }),
};

const query = z.object({
  limit: z
    .string()
    .optional()
    .refine((val) => !isNaN(Number(val)), {
      message: "Limit must be an integer",
    })
    .transform((val) => (val ? Number(val) : undefined)),
  page: z
    .string()
    .optional()
    .refine((val) => !isNaN(Number(val)), {
      message: "Page must be an integer",
    })
    .transform((val) => (val ? Number(val) : undefined)),
});

// export const getAllProductsSchema = object({
//   ...query,
// });

export const createProductSchema = object({
  ...payload,
});

export const updateProductSchema = object({
  ...payload,
  ...params,
});

export const deleteProductSchema = object({
  ...params,
});

export const getProductSchema = object({
  ...params,
});

// export const getAllProductsSchema = z.object({
//   query: z.object({
//     limit: z.string().optional(),
//     page: z.string().optional(),
//   }),
// });

export const getAllProductsSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .refine((val) => !val || /^\d+$/.test(val), {
        message: "Limit must be a number",
      }),
    page: z
      .string()
      .optional()
      .refine((val) => !val || /^\d+$/.test(val), {
        message: "Page must be a number",
      }),
  }),
});

export type CreateProductInput = TypeOf<typeof createProductSchema>;
export type UpdateProductInput = TypeOf<typeof updateProductSchema>;
export type ReadProductInput = TypeOf<typeof getProductSchema>;
export type DeleteProductInput = TypeOf<typeof deleteProductSchema>;
// export type GetAllProductsInput = TypeOf<typeof getAllProductsSchema>;
export type GetAllProductsInput = z.infer<typeof getAllProductsSchema>;
