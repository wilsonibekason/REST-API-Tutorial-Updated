import { object, string, TypeOf } from "zod";

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserInput:
 *      type: object
 *      required:
 *        - email
 *        - name
 *        - password
 *        - passwordConfirmation
 *      properties:
 *        email:
 *          type: string
 *          default: jane.doe@example.com
 *        name:
 *          type: string
 *          default: Jane Doe
 *        password:
 *          type: string
 *          default: stringPassword123
 *        passwordConfirmation:
 *          type: string
 *          default: stringPassword123
 *    CreateUserResponse:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *        name:
 *          type: string
 *        _id:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 *    LoginUserInput:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          default: jane.doe@example.com
 *        password:
 *          type: string
 *          default: stringPassword123
 */

export const createUserSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password too short - should be 6 chars minimum"),
    passwordConfirmation: string({
      required_error: "passwordConfirmation is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Invalid email format"),
    password: string({
      required_error: "Password is required",
    }),
  }),
});

//

// Forgot Password Schema
export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Invalid email format"),
  }),
});

// Reset Password Schema
export const resetPasswordSchema = object({
  body: object({
    token: string({ required_error: "Token is required" }),
    newPassword: string({
      required_error: "New password is required",
    }).min(6, "Password should be at least 6 characters"),
  }),
});

// Change Password Schema
export const changePasswordSchema = object({
  body: object({
    currentPassword: string({
      required_error: "Current password is required",
    }),
    newPassword: string({
      required_error: "New password is required",
    }).min(6, "Password should be at least 6 characters"),
  }),
});

// Update Profile Schema
export const updateProfileSchema = object({
  body: object({
    name: string().optional(),
    email: string().optional(),
    // Add other fields you want to update
  }),
});

export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  "body.passwordConfirmation"
>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>;

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>;
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
export type ChangePasswordInput = TypeOf<typeof changePasswordSchema>;
export type UpdateProfileInput = TypeOf<typeof updateProfileSchema>;
