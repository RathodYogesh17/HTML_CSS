import { Response } from "express";
import { STATUS_CODE, reqInfo, responseMessage } from "../../common";
import { errorResponse, successResponse } from "../../helper";
import { categoryService } from "../../services";

export const addCategory = async (req: any, res: Response) => {
  reqInfo(req);
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const category = await categoryService.createCategoryService(
      req.body.name,
      req.body.description,
      req.user
    );

    return successResponse(
      res,
      responseMessage.addDataSuccess("category"),
      category,
      STATUS_CODE.CREATED
    );
  } catch (error: any) {
    console.log(error);

    if (error.message === "ALREADY_EXISTS") {
      return errorResponse(
        res,
        responseMessage.dataAlreadyExist("Category"),
        STATUS_CODE.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};


export const getAllCategory = async (req: any, res: Response) => {
  reqInfo(req);
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const result = await categoryService.getAllCategoryService(
      req.user,
      req.query
    );

    return successResponse(
      res,
      responseMessage.getDataSuccess("categories"),
      result,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.log(error);
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};


export const getCategory = async (req: any, res: Response) => {
  reqInfo(req);
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const category = await categoryService.getCategoryByIdService(
      req.params.id,
      req.user
    );

    if (!category) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("category"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.getDataSuccess("category"),
      category,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.log(error);
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY (Secure)
|--------------------------------------------------------------------------
*/
export const updateCategory = async (req: any, res: Response) => {
  reqInfo(req);
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const category = await categoryService.updateCategoryService(
      req.params.id,
      req.body,
      req.user
    );

    if (!category) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("category"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.updateDataSuccess("category"),
      category,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.log("Update category error:", error);

    if (error.message === "FORBIDDEN") {
      return errorResponse(
        res,
        "You don't have permission to update this category",
        STATUS_CODE.BAD_REQUEST
      );
    }

    if (error.message === "CATEGORY_CREATOR_MISSING") {
      return errorResponse(
        res,
        "Category creator information missing. Please contact admin.",
        STATUS_CODE.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY (Soft Delete + Secure)
|--------------------------------------------------------------------------
*/
export const deleteCategory = async (req: any, res: Response) => {
  reqInfo(req);
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const deleted = await categoryService.deleteCategoryService(
      req.params.id,
      req.user
    );

    if (!deleted) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("category"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.deleteDataSuccess("category"),
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.log(error);

    if (error.message === "FORBIDDEN") {
      return errorResponse(
        res,
        responseMessage.accessDenied,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};