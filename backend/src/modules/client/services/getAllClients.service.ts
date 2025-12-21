import { PrismaClient, SocialIdentity } from "@prisma/client";
import { ClientModel } from "../models/client.model"; 

const prisma = new PrismaClient(); 

// Interfaz de parámetros 
interface GetClientsParams {
  page: number;
  limit: number;
  social_identity?: SocialIdentity;
  search?: string;
}

export const getAllClientsService = async (params: GetClientsParams) => {
  const { page, limit, social_identity, search } = params;

  // Calcula el skip para paginación
  const skip = (page - 1) * limit;

  // Construye el where para filtros
  const where: any = {};

  // Filtro por plataforma 
  if (social_identity) {
    where.social_identity = social_identity;
  }

  // Búsqueda por nombre o username 
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }

  // Include condicional según la plataforma
  const include: any = {};

  if (social_identity === "X") {
    include.x_account = true;
  } else if (social_identity === "TIKTOK") {
    include.tiktok_account = true;
  } else if (social_identity === "INSTAGRAM" || social_identity === "FACEBOOK") {
    
  }

  // Consulta principal
  const clients = await prisma.client.findMany({
    where,
    skip,
    take: limit,
    orderBy: { id: "desc" }, 
    include,  
  });

  // Total de cuentas para paginación
  const total = await prisma.client.count({ where });

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    clients,
    total,
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
  };
};