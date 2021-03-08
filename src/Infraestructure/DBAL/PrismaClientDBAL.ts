import { PrismaClient } from "@prisma/client";

export class PrismaClientDBAL {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (
      PrismaClientDBAL.instance === undefined ||
      PrismaClientDBAL.instance === null
    ) {
      PrismaClientDBAL.instance = new PrismaClient();
    }
    return PrismaClientDBAL.instance;
  }
}
