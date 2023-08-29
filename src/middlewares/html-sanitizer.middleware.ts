import sanitizeHtml from "sanitize-html";
import { Request, Response, NextFunction } from "express";

const requestSanitizer = (req: Request, res: Response, next: NextFunction) => {
  const { body } = req;
  const { params } = req;
  const { query } = req;

  if (body) {
    const sanitizeBody = (body: any) => {
      for (const key in body) {
        if (typeof body[key] === "string") {
          body[key] = sanitizeHtml(body[key] as string);
        } else if (typeof body[key] === "object") {
          sanitizeBody(body[key]);
        }
      }
    };

    sanitizeBody(body);
  }

  if (params) {
    for (const key in params) {
      if (typeof params[key] === "string") {
        params[key] = sanitizeHtml(params[key] as string);
      }
    }
  }

  if (query) {
    for (const key in query) {
      if (typeof query[key] === "string") {
        query[key] = sanitizeHtml(query[key] as string);
      }
    }
  }

  next();
};

export default requestSanitizer;
