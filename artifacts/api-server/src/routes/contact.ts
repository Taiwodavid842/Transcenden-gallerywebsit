import { CreateContactMessageBody, CreateContactMessageResponse } from "@workspace/api-zod";
import { contactMessagesTable, db } from "@workspace/db";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const requestBody = req.body;
  const normalizedBody =
    typeof requestBody === "object" &&
    requestBody !== null &&
    !Array.isArray(requestBody)
      ? {
          ...requestBody,
          name:
            typeof requestBody.name === "string"
              ? requestBody.name.trim()
              : requestBody.name,
          email:
            typeof requestBody.email === "string"
              ? requestBody.email.trim().toLowerCase()
              : requestBody.email,
          message:
            typeof requestBody.message === "string"
              ? requestBody.message.trim()
              : requestBody.message,
        }
      : requestBody;

  const parsed = CreateContactMessageBody.safeParse(normalizedBody);
  if (!parsed.success) {
    res.status(400).json({
      error: "Please check your name, email, project type, and message, then try again.",
    });
    return;
  }

  try {
    const [savedMessage] = await db
      .insert(contactMessagesTable)
      .values(parsed.data)
      .returning({
        id: contactMessagesTable.id,
        createdAt: contactMessagesTable.createdAt,
      });

    if (!savedMessage) {
      req.log.error(
        { category: "contact-message-persistence" },
        "Contact message insert returned no row",
      );
      res.status(503).json({
        error: "We could not save your message right now. Please try again shortly.",
      });
      return;
    }

    res.status(201).json(CreateContactMessageResponse.parse(savedMessage));
  } catch {
    // Do not log the request body or database error details, which can contain
    // customer information or query values.
    req.log.error(
      { category: "contact-message-persistence" },
      "Contact message could not be saved",
    );
    res.status(503).json({
      error: "We could not save your message right now. Please try again shortly.",
    });
  }
});

export default router;
