import { Response } from "express";
import { STATUS_CODE, reqInfo, responseMessage } from "../../common";
import { errorResponse, successResponse } from "../../helper";
import { StoreService } from "../../services/store";
import { createStoreValidation, updateStoreValidation } from "../../validation/store";

export class StoreController {
  
  static async create(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      // Validate request body
      const { error } = createStoreValidation.validate(req.body);
      if (error) {
        return errorResponse(
          res,
          error.message,
          STATUS_CODE.BAD_REQUEST
        );
      }

      // Add createdBy information from authenticated user (optional)
      const storeData = {
        ...req.body,
        // createdBy: req.user.userId, // Comment this out if your model doesn't have createdBy
        createdAt: new Date()
      };

      const store = await StoreService.createStore(storeData);

      return successResponse(
        res,
        responseMessage.addDataSuccess("store"),
        store,
        STATUS_CODE.CREATED
      );

    } catch (error: any) {
      console.log("Create store error:", error);

      if (error.message === "ALREADY_EXISTS" || error.message?.includes("already exists")) {
        return errorResponse(
          res,
          responseMessage.dataAlreadyExist("Store"),
          STATUS_CODE.BAD_REQUEST
        );
      }

      return errorResponse(
        res,
        error.message || responseMessage.internalServerError,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getAll(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      let filter = {};
      
    

      const result = await StoreService.getAllStores(filter, req.query);

      return successResponse(
        res,
        responseMessage.getDataSuccess("stores"),
        result,
        STATUS_CODE.SUCCESS
      );

    } catch (error: any) {
      console.log("Get all stores error:", error);
      
      return errorResponse(
        res,
        error.message || responseMessage.internalServerError,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getById(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      const store = await StoreService.getStoreById(req.params.id);

      if (!store) {
        return errorResponse(
          res,
          responseMessage.getDataNotFound("store"),
          STATUS_CODE.NOT_FOUND
        );
      }

      return successResponse(
        res,
        responseMessage.getDataSuccess("store"),
        store,
        STATUS_CODE.SUCCESS
      );

    } catch (error: any) {
      console.log("Get store by id error:", error);
      
      return errorResponse(
        res,
        error.message || responseMessage.internalServerError,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async update(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      // Validate request body
      const { error } = updateStoreValidation.validate(req.body);
      if (error) {
        return errorResponse(
          res,
          error.message,
          STATUS_CODE.BAD_REQUEST
        );
      }

      const store = await StoreService.updateStore(
        req.params.id,
        req.body,
        req.user
      );

      if (!store) {
        return errorResponse(
          res,
          responseMessage.getDataNotFound("store"),
          STATUS_CODE.NOT_FOUND
        );
      }

      return successResponse(
        res,
        responseMessage.updateDataSuccess("store"),
        store,
        STATUS_CODE.SUCCESS
      );

    } catch (error: any) {
      console.log("Update store error:", error);

      if (error.message === "UNAUTHORIZED") {
        return errorResponse(
          res,
          responseMessage.accessDenied,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      if (error.message === "ALREADY_EXISTS" || error.message?.includes("already exists")) {
        return errorResponse(
          res,
          responseMessage.dataAlreadyExist("Store"),
          STATUS_CODE.BAD_REQUEST
        );
      }

      return errorResponse(
        res,
        error.message || responseMessage.internalServerError,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async delete(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      const deleted = await StoreService.deleteStore(
        req.params.id,
        req.user
      );

      if (!deleted) {
        return errorResponse(
          res,
          responseMessage.getDataNotFound("store"),
          STATUS_CODE.NOT_FOUND
        );
      }

      return successResponse(
        res,
        responseMessage.deleteDataSuccess("store"),
        null,
        STATUS_CODE.SUCCESS
      );

    } catch (error: any) {
      console.log("Delete store error:", error);

      if (error.message === "UNAUTHORIZED") {
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
  }

  // Additional useful endpoints
  static async getMyStores(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      const stores = await StoreService.getStoresByUser(req.user.userId);

      return successResponse(
        res,
        responseMessage.getDataSuccess("your stores"),
        stores,
        STATUS_CODE.SUCCESS
      );

    } catch (error: any) {
      console.log("Get my stores error:", error);
      
      return errorResponse(
        res,
        error.message || responseMessage.internalServerError,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async toggleStatus(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      // Only admin can toggle status
      if (req.user.role !== 'ADMIN') {
        return errorResponse(
          res,
          responseMessage.accessDenied,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      const store = await StoreService.toggleStoreStatus(req.params.id);

      if (!store) {
        return errorResponse(
          res,
          responseMessage.getDataNotFound("store"),
          STATUS_CODE.NOT_FOUND
        );
      }

      return successResponse(
        res,
        "Store status updated successfully",
        store,
        STATUS_CODE.SUCCESS
      );

    } catch (error: any) {
      console.log("Toggle store status error:", error);
      
      return errorResponse(
        res,
        error.message || responseMessage.internalServerError,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getStoreStats(req: any, res: Response) {
    reqInfo(req);
    try {
      if (!req.user) {
        return errorResponse(
          res,
          responseMessage.unauthorized,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      // Only admin can view statistics
      if (req.user.role !== 'ADMIN') {
        return errorResponse(
          res,
          responseMessage.accessDenied,
          STATUS_CODE.UNAUTHORIZED
        );
      }

      const stats = await StoreService.getStoreStatistics();

      return successResponse(
        res,
        "Store statistics retrieved successfully",
        stats,
        STATUS_CODE.SUCCESS
      );

    } catch (error: any) {
      console.log("Get store stats error:", error);
      
      return errorResponse(
        res,
        error.message || responseMessage.internalServerError,
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const storeController = StoreController;