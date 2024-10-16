import { Request, Response } from "express";
import {
  CreateProductInput,
  GetAllProductsInput,
  UpdateProductInput,
} from "../schema/product.schema";
import {
  createProduct,
  deleteProduct,
  findAndUpdateProduct,
  findProduct,
  findProducts,
} from "../service/product.service";

export async function createProductHandler(
  req: Request<{}, {}, CreateProductInput["body"]>,
  res: Response
) {
  const userId = res.locals.user._id;
  console.log("USER", userId);

  const body = req.body;

  const product = await createProduct({ ...body, user: userId });

  return res.send(product);
}

export async function updateProductHandler(
  req: Request<UpdateProductInput["params"]>,
  res: Response
) {
  const userId = res.locals.user._id;

  const productId = req.params.productId;
  const update = req.body;

  const product = await findProduct({ productId });

  if (!product) {
    return res.sendStatus(404);
  }

  if (String(product.user) !== userId) {
    return res.sendStatus(403);
  }

  const updatedProduct = await findAndUpdateProduct({ productId }, update, {
    new: true,
  });

  return res.send(updatedProduct);
}

export async function getProductHandler(
  req: Request<UpdateProductInput["params"]>,
  res: Response
) {
  const productId = req.params.productId;
  const product = await findProduct({ productId });

  if (!product) {
    return res.sendStatus(404);
  }

  return res.send(product);
}

// export async function getAllProductHandler(
//   req: Request<GetAllProductsInput>,
//   res: Response
// ) {
//   const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10 products per page
//   const page = parseInt(req.query.page as string) || 1; // Default page to 1
//   const skip = (page - 1) * limit;

//   // const products = await findProduct({}, { skip, limit }); // Retrieve products with pagination
//   const products = await findProducts({}, { limit: 10, skip });

//   return res.send(products);
// }

export async function getAllProductHandler(
  // req: Request<GetAllProductsInput['params'], any, any, GetAllProductsInput['query']>,
  req: Request<{}, any, any, GetAllProductsInput["query"]>,
  res: Response
) {
  const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10 products per page
  const page = parseInt(req.query.page as string) || 1; // Default page to 1
  const skip = (page - 1) * limit;

  // Fetch products with pagination
  const products = await findProducts({}, { limit, skip });

  return res.send(products);
}

export async function deleteProductHandler(
  req: Request<UpdateProductInput["params"]>,
  res: Response
) {
  const userId = res.locals.user._id;
  const productId = req.params.productId;

  const product = await findProduct({ productId });

  if (!product) {
    return res.sendStatus(404);
  }

  if (String(product.user) !== userId) {
    return res.sendStatus(403);
  }

  await deleteProduct({ productId });

  return res.sendStatus(200);
}
