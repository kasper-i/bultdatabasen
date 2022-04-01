import { Bolt, BoltType } from "@/models/bolt";
import { Point } from "@/models/point";
import { usePoints } from "@/queries/pointQueries";
import React, { ReactElement, useEffect, useState } from "react";
import Button from "./atoms/Button";
import Icon from "./atoms/Icon";
import IconButton from "./atoms/IconButton";
import RadioGroup, { Option } from "./atoms/RadioGroup";
import { Switch } from "./atoms/Switch";

const boltTypeOptions: Option<BoltType>[] = [
  { value: "expansion", label: "Expander" },
  { value: "glue", label: "Limbult" },
];

interface Props {
  routeId: string;
}

function PointWizard({ routeId }: Props): ReactElement {
  const [isAnchor, setIsAnchor] = useState(false);

  const [bolts, setBolts] = useState<[number, Pick<Bolt, "type">][]>([
    [0, { type: "expansion" }],
  ]);

  useEffect(() => {
    if (isAnchor && bolts.length === 1) {
      addBolt();
    }
  }, [isAnchor]);

  const addBolt = () => {
    setBolts((bolts) => [...bolts, [bolts.length, { type: "expansion" }]]);
  };

  const removeBolt = (index: number) => {
    setBolts((bolts) => bolts.filter(([i]) => i !== index));
  };

  const updateBolt = (index: number, updates: Partial<Pick<Bolt, "type">>) => {
    setBolts((bolts) =>
      bolts.map((entry) => {
        const [i, bolt] = entry;

        if (i === index) {
          return [i, { ...bolt, ...updates }];
        } else {
          return entry;
        }
      })
    );
  };

  return (
    <div className="bg-white shadow-sm border border-gray-300 border-t-4 border-t-primary-500 flex flex-col items-start p-4 text-black">
      <div className="flex flex-col w-full">
        <Switch enabled={isAnchor} onChange={setIsAnchor} />
        <p className="mt-4 mb-1 font-medium">Bultar</p>
        <div className="flex flex-wrap gap-4 mb-4">
          {bolts.map(([index, bolt]) => (
            <div
              key={index}
              className="h-28 w-28 border-2 border-primary-500 rounded-md flex flex-col justify-between p-2"
            >
              <div className="flex justify-between items-center">
                <p className="text-left font-medium">
                  {index === 0 ? "Vänster" : "Höger"}
                </p>
                {index === 1 && (
                  <div onClick={() => removeBolt(index)}>
                    <Icon
                      name="trash"
                      className="text-red-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <RadioGroup<BoltType>
                options={boltTypeOptions}
                value={bolt.type}
                onChange={(type) => updateBolt(index, { type })}
              />
            </div>
          ))}
          {bolts.length < 2 && (
            <div
              key="new"
              className="h-28 w-28 border-2 border-gray-300 border-dashed rounded-md flex justify-center items-center"
            >
              <div onClick={addBolt}>
                <Icon
                  name="plus"
                  big
                  className="cursor-pointer text-primary-500"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 w-full">
          <Button>Avbryt</Button>
          <Button disabled>Skapa</Button>
        </div>
      </div>
    </div>
  );
}

export default PointWizard;
