import ChildrenTable from "@/components/ChildrenTable";
import Search from "@/components/Search";
import { rootNodeId } from "@/constants";

const RootPage = () => {
  return (
    <div data-tailwind="flex flex-grow flex-col items-center">
      <h1 data-tailwind="text-center text-4xl leading-tight">
        <span data-tailwind="text-transparent font-bold bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300">
          bult
        </span>
        databasen
      </h1>
      <p data-tailwind="text-md text-center text-gray-700">
        En databas över borrbultar och ankare på klätterleder i Västsverige.
      </p>
      <div data-tailwind="mt-5 w-full mb-5">
        <Search />
      </div>
      <ChildrenTable resourceId={rootNodeId} filters={{ types: ["area"] }} />
    </div>
  );
};

export default RootPage;
