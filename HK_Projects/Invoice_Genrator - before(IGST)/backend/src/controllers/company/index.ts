import { Response } from "express";
import { authRequest } from "../../middleware";
import { STATUS_CODE, responseMessage } from "../../common";
import * as companyService from "../../services/company";
import { successResponse, errorResponse } from "../../helper";

export const createCompany = async (req: authRequest, res: Response) => {
  try {
    if (!req.user)
      return errorResponse(res, responseMessage.unauthorized, STATUS_CODE.UNAUTHORIZED);

    const company = await companyService.createCompanyService(
      req.body,
      req.user
    );

    return successResponse(
      res,
      responseMessage.addDataSuccess("company"),
      company,
      STATUS_CODE.CREATED
    );
  } catch (error: any) {
    if (error.message === "ALREADY_EXISTS")
      return errorResponse(res, "Company already exists", STATUS_CODE.BAD_REQUEST);

    if (error.message === "FORBIDDEN")
      return errorResponse(res, responseMessage.accessDenied, STATUS_CODE.UNAUTHORIZED);

    return errorResponse(res, responseMessage.internalServerError, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
};


export const getAllCompanies = async (req: authRequest, res: Response) => {
  try {
    if (!req.user)
      return errorResponse(res, responseMessage.unauthorized, STATUS_CODE.UNAUTHORIZED);

    const result = await companyService.getAllCompaniesService(
      req.user,
      req.query
    );

    return successResponse(
      res,
      responseMessage.getDataSuccess("companies"),
      result,
      STATUS_CODE.SUCCESS
    );
  } catch {
    return errorResponse(res, responseMessage.internalServerError, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
};


export const getCompany = async (req: authRequest, res: Response) => {
  try {
    if (!req.user)
      return errorResponse(res, responseMessage.unauthorized, STATUS_CODE.UNAUTHORIZED);

    const company = await companyService.getCompanyByIdService(
      req.params.id,
      req.user
    );

    if (!company)
      return errorResponse(res, responseMessage.getDataNotFound("company"), STATUS_CODE.NOT_FOUND);

    return successResponse(
      res,
      responseMessage.getDataSuccess("company"),
      company,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    if (error.message === "FORBIDDEN")
      return errorResponse(res, responseMessage.accessDenied, STATUS_CODE.UNAUTHORIZED);

    return errorResponse(res, responseMessage.internalServerError, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
};


export const updateCompany = async (req: authRequest, res: Response) => {
  try {
    if (!req.user)
      return errorResponse(res, responseMessage.unauthorized, STATUS_CODE.UNAUTHORIZED);

    const company = await companyService.updateCompanyService(
      req.params.id,
      req.body,
      req.user
    );

    if (!company)
      return errorResponse(res, responseMessage.getDataNotFound("company"), STATUS_CODE.NOT_FOUND);

    return successResponse(
      res,
      responseMessage.updateDataSuccess("company"),
      company,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    if (error.message === "FORBIDDEN")
      return errorResponse(res, responseMessage.accessDenied, STATUS_CODE.UNAUTHORIZED);

    return errorResponse(res, responseMessage.internalServerError, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
};


export const deleteCompany = async (req: authRequest, res: Response) => {
  try {
    if (!req.user)
      return errorResponse(res, responseMessage.unauthorized, STATUS_CODE.UNAUTHORIZED);

    const deleted = await companyService.deleteCompanyService(
      req.params.id,
      req.user
    );

    if (!deleted)
      return errorResponse(res, responseMessage.getDataNotFound("company"), STATUS_CODE.NOT_FOUND);

    return successResponse(
      res,
      responseMessage.deleteDataSuccess("company"),
      null,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    if (error.message === "FORBIDDEN")
      return errorResponse(res, responseMessage.accessDenied, STATUS_CODE.UNAUTHORIZED);

    return errorResponse(res, responseMessage.internalServerError, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
};

export const getMyCompanies = async (req: authRequest, res: Response) => {
  try {
    if (!req.user)
      return errorResponse(res, responseMessage.unauthorized, STATUS_CODE.UNAUTHORIZED);

    const companies = await companyService.getMyCompaniesService(req.user);

    return successResponse(
      res,
      responseMessage.getDataSuccess("companies"),
      companies,
      STATUS_CODE.SUCCESS
    );
  } catch (error: any) {
    return errorResponse(res, responseMessage.internalServerError, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
};