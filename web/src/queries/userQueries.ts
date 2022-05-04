import { Api } from "@/Api";
import { useQuery } from "react-query";

export const useUserNames = () =>
  useQuery(["user-names"], () => Api.getUserNames(), {
    select: (data) => new Map(data.map((user) => [user.id, user])),
  });
