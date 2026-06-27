import "server-only";
import type { Role, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/security";

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  image: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: SAFE_SELECT,
  });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive?: boolean;
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      isActive: input.isActive ?? true,
    },
    select: SAFE_SELECT,
  });
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
}

export async function updateUser(input: UpdateUserInput) {
  const data: Prisma.UserUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;
  if (input.role !== undefined) data.role = input.role;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) data.passwordHash = await hashPassword(input.password);

  return prisma.user.update({
    where: { id: input.id },
    data,
    select: SAFE_SELECT,
  });
}

export async function deactivateUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: SAFE_SELECT,
  });
}
