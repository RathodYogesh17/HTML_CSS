import { STATUS_CODE, responseMessage } from "../../common";
import { successResponse, errorResponse } from "../../helper";
import { productService } from "../../services";

export const addProduct = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const product = await productService.createProductService(
      req.body,
      req.user
    );

    return successResponse(
      res,
      responseMessage.addDataSuccess("product"),
      product,
      STATUS_CODE.CREATED
    );
  } catch (error: any) {
    console.log(error);

    if (error.message === "CATEGORY_NOT_FOUND") {
      return errorResponse(res, "Category not found", STATUS_CODE.NOT_FOUND);
    }

    if (error.message === "PRODUCT_ALREADY_EXISTS") {
      return errorResponse(res, "Product already exists", STATUS_CODE.BAD_REQUEST);
    }

    if (error.message === "ACCESS_DENIED") {
      return errorResponse(
        res,
        responseMessage.accessDenied,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const getProduct = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const product = await productService.getSingleProductService(
      req.params.id,
      req.user
    );

    if (!product) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("product"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.getDataSuccess("product"),
      product,
      STATUS_CODE.SUCCESS
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const getAllProduct = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const result = await productService.getAllProductService(
      req.query,
      req.user 
    );

    return successResponse(
      res,
      responseMessage.getDataSuccess("products"),
      result,
      STATUS_CODE.SUCCESS
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const updateProduct = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    console.log("===== UPDATE PRODUCT DEBUG =====");
    console.log("Product ID:", req.params.id);
    console.log("Update data:", req.body);
    console.log("User object:", {
      userId: req.user.userId,
      role: req.user.role,
      stores: req.user.stores,
      _id: req.user._id,
      id: req.user.id
    });
    console.log("================================");

    const product = await productService.updateProductService(
      req.params.id,
      req.body,
      req.user
    );

    if (!product) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("product"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.updateDataSuccess("product"),
      product,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.log("Update product error:", error);
    
    if (error.message === "ACCESS_DENIED") {
      return errorResponse(
        res,
        responseMessage.accessDenied,
        STATUS_CODE.BAD_REQUEST 
      );
    }

    if (error.message === "CATEGORY_NOT_FOUND") {
      return errorResponse(
        res,
        "Category not found",
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

export const deleteProduct = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const product = await productService.deleteProductService(
      req.params.id,
      req.user
    );

    if (!product) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("product"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.deleteDataSuccess("product"),
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    console.log(error);

    if (error.message === "ACCESS_DENIED") {
      return errorResponse(
        res,
        responseMessage.accessDenied,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

export const getMyProducts = async (req: any, res: any) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    console.log("User in getMyProducts:", {
      userId: req.user.userId,
      role: req.user.role,
      stores: req.user.stores
    });

    const products = await productService.getMyProductsService(req.user);
    
    console.log("Products to return:", products.length); 

    return successResponse(
      res,
      responseMessage.getDataSuccess("products"),
      products,
      STATUS_CODE.SUCCESS
    );
  } catch (error) {
    console.log("Error in getMyProducts:", error);
    return errorResponse(
      res,
      responseMessage.internalServerError,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
};