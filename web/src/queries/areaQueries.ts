import { useQuery } from "react-query";
import { Api } from "../Api";

export const useAreas = () => useQuery("areas", () => Api.getAreas());
