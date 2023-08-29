import { NextFunction, Request, Response } from "express";
import { APIFeatures, QueryString } from "./util.service";
import { AppError, asyncErrorCatcher, validatePatchRequestBody } from "./error.service";
import { Model as ModelType } from "mongoose";
import { logger } from "./logger.service";

const getAll = (Model: ModelType<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(Model.find(), req.query as QueryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.getQuery();

    res.status(200).json({
      status: "success",
      requestedAt: new Date().toISOString(),
      results: docs.length,
      data: docs,
    });
  });

const getOne = (Model: ModelType<any>, popOptions?: string) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const dataName = Model.collection.collectionName;
    const { id } = req.params;
    const query = Model.findById(id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;
    if (!doc)
      throw new AppError(
        `No ${dataName.slice(0, dataName.length - 1)} was found with the id: ${id}`,
        404
      );
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

const createOne = (Model: ModelType<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

const updateOne = (Model: ModelType<any>, allowedFields?: string[]) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const dataName = Model.collection.collectionName;
    const { id } = req.params;
    validatePatchRequestBody(req.body);
    if (allowedFields) {
      for (const key in req.body) {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      }
    }
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      throw new AppError(
        `No ${dataName.slice(0, dataName.length - 1)} was found with the id: ${id}`,
        404
      );

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

const deleteOne = (Model: ModelType<any>) =>
  asyncErrorCatcher(async (req: Request, res: Response, next: NextFunction) => {
    const dataName = Model.collection.collectionName;
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc)
      throw new AppError(
        `No ${dataName.slice(0, dataName.length - 1)} was found with the id: ${id}`,
        404
      );

    logger.warn(`Deleted ${dataName.slice(0, dataName.length - 1)} with id: ${id}`);

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
export default { getAll, getOne, createOne, updateOne, deleteOne };
