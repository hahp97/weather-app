import { ZodIssue } from "zod";

export const normalizeErrors = (errors: ZodIssue[]) => {
  return errors.map((error) => {
    const path =
      error.path.length > 2 ? error.path.filter((segment) => typeof segment !== "number").join(".") : error.path[0];
    return {
      path: path,
      field: error.path[0],
      message: error.message,
    };
  });
};
