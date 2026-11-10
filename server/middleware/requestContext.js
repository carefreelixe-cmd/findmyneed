import crypto from "crypto";

export const requestContext = (req, res, next) => {
  const incomingId = req.get("x-request-id");
  req.requestId = incomingId?.slice(0, 100) || crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
};
