import { Express, Request, Response } from "express";
import {
  createProductHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getAllProductHandler,
} from "./controller/product.controller";
import {
  createUserSessionHandler,
  getUserSessionsHandler,
  deleteSessionHandler,
} from "./controller/session.controller";
import {
  createUserHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  verifyEmailHandler,
  changePasswordHandler,
  updateProfileHandler,
  logoutHandler,
} from "./controller/user.controller";
import requireUser from "./middleware/requireUser";
import validateResource, { validateV2 } from "./middleware/validateResource";
import {
  createProductSchema,
  deleteProductSchema,
  getAllProductsSchema,
  getProductSchema,
  updateProductSchema,
} from "./schema/product.schema";
import { createSessionSchema } from "./schema/session.schema";
import { findAnonProducts } from "./service/product.service";
import {
  loginUserSchema,
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  LoginUserInput,
} from "./schema/user.schema";
import { sign } from "jsonwebtoken";
import { validatePassword } from "./service/user.service";
import { signJwt } from "./utils/jwt.utils";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "gDq+dcQYo/iBT5vixNnjN+q7LHqxMHenxmXiOzp+2VwM8St6K6aXOFrcGEebpPlFkqcAf1b3Q5rmmjFb";

function routes(app: Express) {
  /**
   * @openapi
   * /healthcheck:
   *  get:
   *     tags:
   *     - Healthcheck
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: App is up and running
   */
  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  /**
   * @openapi
   * '/api/users/login':
   *  post:
   *     tags:
   *     - User
   *     summary: Login a user
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/LoginUserInput'
   *     responses:
   *      200:
   *        description: Login successful
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                user:
   *                  type: object
   *                  $ref: '#/components/schemas/User'
   *                token:
   *                  type: string
   *      401:
   *        description: Unauthorized
   */
  app.post(
    "/api/users/login",
    validateResource(loginUserSchema),
    async (req: Request<{}, {}, LoginUserInput["body"]>, res: Response) => {
      const { email, password } = req.body;

      const user = await validatePassword({ email, password });

      if (!user) {
        return res.status(401).send("Invalid email or password");
      }

      // Generate JWT token
      // const token = sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
      // Generate JWT token
      const token = signJwt({ id: user._id }, "accessTokenPrivateKey", {
        expiresIn: "1h",
      });

      return res.send({ user, token });
    }
  );

  /**
   * @openapi
   * '/api/users':
   *  post:
   *     tags:
   *     - User
   *     summary: Register a user
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/CreateUserInput'
   *     responses:
   *      200:
   *        description: Success
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/CreateUserResponse'
   *      409:
   *        description: Conflict
   *      400:
   *        description: Bad request
   */

  /**
   * @openapi
   * '/api/logout':
   *  post:
   *     tags:
   *     - User
   *     summary: Log out the user and blacklist the token
   *     responses:
   *      200:
   *        description: Successfully logged out
   *      400:
   *        description: No token provided
   *      401:
   *        description: Token is invalid or already blacklisted
   *      500:
   *        description: An error occurred during logout
   */

  /**
   * @openapi
   * '/api/forgot-password':
   *  post:
   *     tags:
   *     - User
   *     summary: Initiate password reset
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/ForgotPasswordInput'
   *     responses:
   *      200:
   *        description: Password reset email sent
   *      400:
   *        description: Bad request
   *      404:
   *        description: User not found
   */

  /**
   * @openapi
   * '/api/reset-password':
   *  put:
   *     tags:
   *     - User
   *     summary: Reset password with token
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/ResetPasswordInput'
   *     responses:
   *      200:
   *        description: Password reset successful
   *      400:
   *        description: Bad request
   *      404:
   *        description: Invalid or expired token
   */

  /**
   * @openapi
   * '/api/verify-email':
   *  get:
   *     tags:
   *     - User
   *     summary: Verify email with token
   *     parameters:
   *     - name: token
   *       in: query
   *       required: true
   *       description: Email verification token
   *       schema:
   *         type: string
   *     responses:
   *      200:
   *        description: Email verification successful
   *      400:
   *        description: Invalid or expired token
   *      404:
   *        description: User not found
   */

  /**
   * @openapi
   * '/api/change-password':
   *  put:
   *     tags:
   *     - User
   *     summary: Change password while logged in
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/ChangePasswordInput'
   *     responses:
   *      200:
   *        description: Password changed successfully
   *      400:
   *        description: Bad request
   *      401:
   *        description: Unauthorized or incorrect current password
   */

  /**
   * @openapi
   * '/api/update-profile':
   *  put:
   *     tags:
   *     - User
   *     summary: Update user profile
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/UpdateProfileInput'
   *     responses:
   *      200:
   *        description: Profile updated successfully
   *      400:
   *        description: Bad request
   *      404:
   *        description: User not found
   */

  app.post("/api/users", validateResource(createUserSchema), createUserHandler);
  app.post("/api/logout", logoutHandler);
  app.post(
    "/api/forgot-password",
    validateResource(forgotPasswordSchema),
    forgotPasswordHandler
  );
  app.put(
    "/api/reset-password",
    validateResource(resetPasswordSchema),
    resetPasswordHandler
  );
  app.get("/api/verify-email", verifyEmailHandler);
  app.put(
    "/api/change-password",
    validateResource(changePasswordSchema),
    changePasswordHandler
  );
  app.put(
    "/api/update-profile",
    validateResource(updateProfileSchema),
    updateProfileHandler
  );

  /**
   * @openapi
   * '/api/sessions':
   *  get:
   *    tags:
   *    - Session
   *    summary: Get all sessions
   *    responses:
   *      200:
   *        description: Get all sessions for current user
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/GetSessionResponse'
   *      403:
   *        description: Forbidden
   *  post:
   *    tags:
   *    - Session
   *    summary: Create a session
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/CreateSessionInput'
   *    responses:
   *      200:
   *        description: Session created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/CreateSessionResponse'
   *      401:
   *        description: Unauthorized
   *  delete:
   *    tags:
   *    - Session
   *    summary: Delete a session
   *    responses:
   *      200:
   *        description: Session deleted
   *      403:
   *        description: Forbidden
   */
  app.post(
    "/api/sessions",
    validateResource(createSessionSchema),
    createUserSessionHandler
  );

  app.get("/api/sessions", requireUser, getUserSessionsHandler);

  app.delete("/api/sessions", requireUser, deleteSessionHandler);

  /**
   * @openapi
   * '/api/products':
   *  post:
   *     tags:
   *     - Products
   *     summary: Create a new product
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schema/Product'
   *     responses:
   *       200:
   *         description: Product created
   *         content:
   *          application/json:
   *           schema:
   *              $ref: '#/components/schema/productResponse'
   *           example:
   *             "user": "642a0de05f16e6dad68efdad"
   *             "title": "Canon EOS 1500D DSLR Camera with 18-55mm Lens"
   *             "description": "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go."
   *             "price": 879.99
   *             "image": "https://i.imgur.com/QlRphfQ.jpg"
   *             "_id": "642a1cfcc1bec76d8a2e7ac2"
   *             "productId": "product_xxqm8z3eho"
   *             "createdAt": "2023-04-03T00:25:32.189Z"
   *             "updatedAt": "2023-04-03T00:25:32.189Z"
   *             "__v": 0
   */
  app.post(
    "/api/products",
    [requireUser, validateResource(createProductSchema)],
    createProductHandler
  );

  /**
   * @openapi
   * '/api/products/all':
   *  get:
   *     tags:
   *     - Products
   *     summary: Retrieve all products
   *     parameters:
   *     - in: query
   *       name: limit
   *       schema:
   *         type: integer
   *       description: Number of products to retrieve per page
   *     - in: query
   *       name: page
   *       schema:
   *         type: integer
   *       description: Page number
   *     responses:
   *       200:
   *         description: Products retrieved
   *         content:
   *          application/json:
   *           schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schema/productResponse'
   *           example:
   *             [
   *               {
   *                 "user": "642a0de05f16e6dad68efdad",
   *                 "title": "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
   *                 "description": "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
   *                 "price": 879.99,
   *                 "image": "https://i.imgur.com/QlRphfQ.jpg",
   *                 "_id": "642a1cfcc1bec76d8a2e7ac2",
   *                 "productId": "product_xxqm8z3eho",
   *                 "createdAt": "2023-04-03T00:25:32.189Z",
   *                 "updatedAt": "2023-04-03T00:25:32.189Z",
   *                 "__v": 0
   *               },
   *               {
   *                 "user": "642a0de05f16e6dad68efdad",
   *                 "title": "Nikon D5600 DSLR Camera with 18-55mm Lens",
   *                 "description": "Take stunning photos and videos with the Nikon D5600 DSLR camera. Featuring a 24.2MP sensor, 1080p Full HD video recording, and built-in Wi-Fi for easy sharing.",
   *                 "price": 799.99,
   *                 "image": "https://i.imgur.com/RGphfQ.jpg",
   *                 "_id": "642a1cfcc1bec76d8a2e7ac3",
   *                 "productId": "product_xxqm8z3eh1",
   *                 "createdAt": "2023-04-03T00:25:32.189Z",
   *                 "updatedAt": "2023-04-03T00:25:32.189Z",
   *                 "__v": 0
   *               }
   *             ]
   *       404:
   *         description: No products found
   */
  app.get(
    "/api/products/all",
    validateV2(getAllProductsSchema),
    getAllProductHandler
  );

  /**
   * @openapi
   * '/api/products/every':
   *  get:
   *     tags:
   *     - Products
   *     summary: Retrieve all products
   *     responses:
   *       200:
   *         description: Products retrieved
   *         content:
   *          application/json:
   *           schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schema/productResponse'
   *           example:
   *             [
   *               {
   *                 "user": "642a0de05f16e6dad68efdad",
   *                 "title": "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
   *                 "description": "Designed for first-time DSLR owners who want impressive results...",
   *                 "price": 879.99,
   *                 "image": "https://i.imgur.com/QlRphfQ.jpg",
   *                 "_id": "642a1cfcc1bec76d8a2e7ac2",
   *                 "productId": "product_xxqm8z3eho",
   *                 "createdAt": "2023-04-03T00:25:32.189Z",
   *                 "updatedAt": "2023-04-03T00:25:32.189Z",
   *                 "__v": 0
   *               },
   *               {
   *                 "user": "642a0de05f16e6dad68efdad",
   *                 "title": "Nikon D5600 DSLR Camera with 18-55mm Lens",
   *                 "description": "Take stunning photos and videos with the Nikon D5600 DSLR camera...",
   *                 "price": 799.99,
   *                 "image": "https://i.imgur.com/RGphfQ.jpg",
   *                 "_id": "642a1cfcc1bec76d8a2e7ac3",
   *                 "productId": "product_xxqm8z3eh1",
   *                 "createdAt": "2023-04-03T00:25:32.189Z",
   *                 "updatedAt": "2023-04-03T00:25:32.189Z",
   *                 "__v": 0
   *               }
   *             ]
   *       404:
   *         description: No products found
   */
  app.get("/api/products/every", getAllProductHandler);

  async function getAllProductHandler(req: Request, res: Response) {
    try {
      const products = await findAnonProducts({}); // Simply fetch all products without limit or skip

      if (!products.length) {
        return res.status(404).send("No products found");
      }

      return res.send(products);
    } catch (error) {
      return res
        .status(500)
        .send("An error occurred while retrieving products");
    }
  }

  /**
   * @openapi
   * '/api/products/{productId}':
   *  get:
   *     tags:
   *     - Products
   *     summary: Get a single product by the productId
   *     parameters:
   *      - name: productId
   *        in: path
   *        description: The id of the product
   *        required: true
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *           schema:
   *              $ref: '#/components/schema/productResponse'
   *       404:
   *         description: Product not found
   *  put:
   *     tags:
   *     - Products
   *     summary: Update a single product
   *     parameters:
   *      - name: productId
   *        in: path
   *        description: The id of the product
   *        required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schema/Product'
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *           schema:
   *              $ref: '#/components/schema/productResponse'
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Product not found
   *  delete:
   *     tags:
   *     - Products
   *     summary: Delete a single product
   *     parameters:
   *      - name: productId
   *        in: path
   *        description: The id of the product
   *        required: true
   *     responses:
   *       200:
   *         description: Product deleted
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Product not found
   */
  app.put(
    "/api/products/:productId",
    [requireUser, validateResource(updateProductSchema)],
    updateProductHandler
  );

  app.get(
    "/api/products/:productId",
    validateResource(getProductSchema),
    getProductHandler
  );

  app.delete(
    "/api/products/:productId",
    [requireUser, validateResource(deleteProductSchema)],
    deleteProductHandler
  );
}

export default routes;
