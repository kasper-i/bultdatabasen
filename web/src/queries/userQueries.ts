import { Api } from "@/Api";
import { useQuery } from "@tanstack/react-query";

export const useUsers = () =>
  useQuery(["users"], () => Api.getUsers(), {
    select: (data) => new Map(data.map((user) => [user.id, user])),
  });
