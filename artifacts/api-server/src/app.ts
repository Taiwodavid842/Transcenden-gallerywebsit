import express, { type Express } from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api", router);

const requestBodyErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  const bodyError =
    typeof error === "object" && error !== null
      ? (error as { type?: string }).type
      : undefined;

  if (bodyError === "entity.too.large") {
    res.status(413).json({ error: "The submitted form is too large." });
    return;
  }

  if (bodyError === "entity.parse.failed") {
    res.status(400).json({ error: "The request body must be valid JSON." });
    return;
  }

  next(error);
};

app.use(requestBodyErrorHandler);

export default app;
