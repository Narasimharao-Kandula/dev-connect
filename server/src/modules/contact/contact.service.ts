import { prisma } from "../../lib/prisma";

export class ContactService {
  async submit(name: string, email: string, subject: string, message: string) {
    return prisma.contactMessage.create({
      data: { name, email, subject, message },
    });
  }
}
