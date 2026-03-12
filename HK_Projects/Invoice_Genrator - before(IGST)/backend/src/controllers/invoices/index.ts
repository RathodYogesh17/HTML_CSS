import { Response } from "express";
import { authRequest } from "../../middleware/auth";
import * as invoiceService from "../../services/invoice";
import { STATUS_CODE } from "../../common/statusCode";
import { responseMessage } from "../../common/Message";
import { errorResponse, successResponse } from "../../helper";



export const createInvoice = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const invoice = await invoiceService.createInvoiceService(
      req.body,
      req.user
    );

    return successResponse(
      res,
      responseMessage.addDataSuccess("Invoice"),
      invoice,
      STATUS_CODE.CREATED
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      error.statusCode || STATUS_CODE.BAD_REQUEST
    );
  }
};

export const getInvoiceById = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const invoice = await invoiceService.getInvoiceByIdService(
      req.params.id,
      req.user
    );

    if (!invoice) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("Invoice"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.getDataSuccess("Invoice"),
      invoice,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      error.statusCode || STATUS_CODE.BAD_REQUEST
    );
  }
};

export const getAllInvoices = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const result = await invoiceService.getAllInvoicesService(
      req.user,
      req.query
    );

    return successResponse(
      res,
      responseMessage.getDataSuccess("Invoices"),
      result,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      error.statusCode || STATUS_CODE.BAD_REQUEST
    );
  }
};

export const updateInvoice = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const invoice = await invoiceService.updateInvoiceService(
      req.params.id,
      req.body,
      req.user
    );

    if (!invoice) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("Invoice"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.updateDataSuccess("Invoice"),
      invoice,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      error.statusCode || STATUS_CODE.BAD_REQUEST
    );
  }
};

export const deleteInvoice = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const invoice = await invoiceService.deleteInvoiceService(
      req.params.id,
      req.user
    );

    if (!invoice) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("Invoice"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      responseMessage.deleteDataSuccess("Invoice"),
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      error.statusCode || STATUS_CODE.BAD_REQUEST
    );
  }
};

export const cancelInvoice = async (req: authRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        responseMessage.unauthorized,
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const invoice = await invoiceService.cancelInvoiceService(
      req.params.id,
      req.user
    );

    if (!invoice) {
      return errorResponse(
        res,
        responseMessage.getDataNotFound("Invoice"),
        STATUS_CODE.NOT_FOUND
      );
    }

    return successResponse(
      res,
      "Invoice cancelled successfully",
      invoice,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || responseMessage.internalServerError,
      error.statusCode || STATUS_CODE.BAD_REQUEST
    );
  }
};