import { api } from "./api";

export type PublicPostDto = {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: any;
  createdAt?: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function getPublicPosts(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<PublicPostDto>> {
  const { data } = await api.get<Paginated<PublicPostDto>>("/posts", {
    params: {
      q: params?.q || undefined,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    },
  });
  return data;
}

export async function getPublicPostById(id: string): Promise<PublicPostDto> {
  const { data } = await api.get<PublicPostDto>(`/posts/${id}`);
  return data;
}