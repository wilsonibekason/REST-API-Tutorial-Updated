import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      return res.status(400).send(e.errors);
    }
  };

export const validateV2 =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      // Respond with a structured error message
      return res.status(400).json({
        errors: result.error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }

    // Attach validated data to req object
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next();
  };

export default validate;
