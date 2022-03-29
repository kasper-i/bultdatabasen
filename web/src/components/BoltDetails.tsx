import { Bolt } from "@/models/bolt";
import { translateBoltType } from "@/utils/boltUtils";
import React, { ReactElement } from "react";

interface Props {
  bolt: Bolt;
}

function BoltDetails({ bolt }: Props): ReactElement {
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="text-gray-600 font-semibold">
        {translateBoltType(bolt.type)}
      </div>
    </div>
  );
}

export default BoltDetails;
