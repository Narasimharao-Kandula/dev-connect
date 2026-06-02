import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ContactService } from "./contact.service";

const service = new ContactService();

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export const submitContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, subject, message } = contactSchema.parse(req.body);
    await service.submit(name, email, subject, message);
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
};
