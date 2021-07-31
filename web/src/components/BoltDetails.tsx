import { Bolt } from "models/bolt";
import { useDeleteBolt } from "queries/boltQueries";
import React, { ReactElement, useState } from "react";
import { Button } from "semantic-ui-react";
import { translateBoltType } from "utils/boltUtils";
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
    <div
      style={{ width: 140 }}
      className="bg-gray-100 shadow rounded p-2 flex flex-col"
    >
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 font-bold">
          <BoltIcon />
          <div>{translateBoltType(bolt.type)}</div>
        </div>
        <Restricted>
          <Button
            icon="trash"
            color="red"
            size="mini"
            loading={deleteBolt.isLoading}
            onClick={() => setDeleteRequested(true)}
          ></Button>
          {deleteRequested && (
            <DeletePrompt
              target={translateBoltType(bolt.type)}
              onCancel={() => setDeleteRequested(false)}
              onConfirm={confirmDelete}
            />
          )}
        </Restricted>
      </div>
      <div className="text-sm pt-2">
        <p>Petzl {bolt.type === "glue" ? "Bat’inox" : "Coeur"}</p>
        <p>316 (A4)</p>
        <p>2012</p>
      </div>
    </div>
  );
}

export default BoltDetails;
