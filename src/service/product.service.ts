import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import ProductModel, {
  ProductDocument,
  ProductInput,
} from "../models/product.model";
import { databaseResponseTimeHistogram } from "../utils/metrics";

export async function createProduct(input: ProductInput) {
  const metricsLabels = {
    operation: "createProduct",
  };

  const timer = databaseResponseTimeHistogram.startTimer();
  try {
    const result = await ProductModel.create(input);
    timer({ ...metricsLabels, success: "true" });
    return result;
  } catch (e) {
    timer({ ...metricsLabels, success: "false" });
    throw e;
  }
}

export async function findProduct(
  query: FilterQuery<ProductDocument>,
  options: QueryOptions = { lean: true }
) {
  const metricsLabels = {
    operation: "findProduct",
  };

  const timer = databaseResponseTimeHistogram.startTimer();
  try {
    const result = await ProductModel.findOne(query, {}, options);
    timer({ ...metricsLabels, success: "true" });
    return result;
  } catch (e) {
    timer({ ...metricsLabels, success: "false" });

    throw e;
  }
}

export async function findProducts(
  query: FilterQuery<ProductDocument>,
  options: {
    limit?: number;
    skip?: number;
    lean?: boolean;
  } = {}
) {
  const { limit = 10, skip = 0, lean = true } = options;
  const metricsLabels = {
    operation: "findProducts",
  };

  const timer = databaseResponseTimeHistogram.startTimer();
  try {
    const result = await ProductModel.find(query, {}, { lean })
      .skip(skip)
      .limit(limit)
      .exec();
    timer({ ...metricsLabels, success: "true" });
    return result;
  } catch (e) {
    timer({ ...metricsLabels, success: "false" });

    throw e;
  }
}

export async function findAnonProducts(
  query: FilterQuery<ProductDocument>,
  options: {
    lean?: boolean; // Retaining the lean option for performance
  } = {}
) {
  const { lean = true } = options; // Default lean to true
  const metricsLabels = {
    operation: "findProducts",
  };

  const timer = databaseResponseTimeHistogram.startTimer();
  try {
    const result = await ProductModel.find(query, {}, { lean }).exec(); // Fetch all products matching the query
    timer({ ...metricsLabels, success: "true" });
    return result;
  } catch (e) {
    timer({ ...metricsLabels, success: "false" });
    throw e;
  }
}

export async function findAndUpdateProduct(
  query: FilterQuery<ProductDocument>,
  update: UpdateQuery<ProductDocument>,
  options: QueryOptions
) {
  return ProductModel.findOneAndUpdate(query, update, options);
}

export async function deleteProduct(query: FilterQuery<ProductDocument>) {
  return ProductModel.deleteOne(query);
}
