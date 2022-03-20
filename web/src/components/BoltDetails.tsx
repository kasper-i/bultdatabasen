import { Bolt } from "@/models/bolt";
import { useDeleteBolt } from "@/queries/boltQueries";
import { translateBoltType } from "@/utils/boltUtils";
import React, { ReactElement, useState } from "react";
import IconButton from "./base/IconButton";
import DeletePrompt from "./DeletePrompt";
import BoltIcon from "./icons/BoltIcon";
import Restricted from "./Restricted";

interface Props {
  routeId: string;
  pointId: string;
  bolt: Bolt;
}

function BoltDetails({ routeId, pointId, bolt }: Props): ReactElement {
  const deleteBolt = useDeleteBolt(routeId, pointId, bolt.id);

  const [deleteRequested, setDeleteRequested] = useState(false);

  const confirmDelete = () => {
    deleteBolt.mutate();
    setDeleteRequested(false);
  };

  return (
    <div className="bg-gray-100 shadow rounded p-2 flex flex-col w-64">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex gap-2 font-bold">
            <BoltIcon />
            {translateBoltType(bolt.type)}
          </div>
        </div>
        <Restricted>
          <IconButton
            icon="trash"
            color="danger"
            loading={deleteBolt.isLoading}
            onClick={() => setDeleteRequested(true)}
          />
          {deleteRequested && (
            <DeletePrompt
              target="bult"
              onCancel={() => setDeleteRequested(false)}
              onConfirm={confirmDelete}
            />
          )}
        </Restricted>
      </div>
    </div>
  );
}

export default BoltDetails;
