import Button from "@/components/atoms/Button";
import { Combobox } from "@/components/atoms/Combobox";
import { Datepicker } from "@/components/atoms/DatePicker";
import IconButton from "@/components/atoms/IconButton";
import Input from "@/components/atoms/Input";
import Modal from "@/components/atoms/Modal";
import Pagination from "@/components/atoms/Pagination";
import Progress from "@/components/atoms/Progress";
import RadioCardsGroup from "@/components/atoms/RadioCardsGroup";
import RadioGroup, { Option } from "@/components/atoms/RadioGroup";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { Menu } from "@/components/molecules/Menu";
import Search from "@/components/Search";
import { useState } from "react";

type Fruit = "banana" | "apple" | "orange";

export const ShowcasePage = () => {
  const [date, setDate] = useState(new Date());
  const [fruit, setFruit] = useState<Fruit>("banana");
  const [name, setName] = useState("Anonymous");
  const [enabled, setEnabled] = useState(false);
  const [page, setPage] = useState(5);
  const [showModal, setShowModal] = useState(false);

  const fruitOptions: Option<Fruit>[] = [
    {
      key: 1,
      label: "Banana",
      value: "banana",
      sublabel: "🍌",
    },
    {
      key: 2,
      label: "Apple",
      value: "apple",
      sublabel: "🍎",
    },
    {
      key: 3,
      label: "Orange",
      value: "orange",
      sublabel: "🍊",
      disabled: !enabled,
    },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-xs">
      <div className="flex flex-wrap gap-2">
        <Button>Save</Button>
        <Button disabled>Save</Button>
        <Button loading>Save</Button>
        <Button icon="wrench">Save</Button>
        <Button outlined>Save</Button>
        <Button color="danger">Delete</Button>
      </div>
      <div className="flex gap-2">
        <IconButton icon="wrench" />
        <IconButton circular icon="wrench" />
        <IconButton tiny icon="wrench" />
      </div>
      <div>
        <Search />
      </div>
      <div>
        <Select<Fruit>
          label="Fruits"
          options={fruitOptions}
          onSelect={setFruit}
          value={fruit}
        />
      </div>
      <div>
        <Combobox<Fruit>
          label="Fruits"
          options={fruitOptions}
          onSelect={setFruit}
          value={fruit}
        />
      </div>
      <div>
        <Datepicker label="Date" value={date} onChange={setDate} />
      </div>
      <div>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Switch label="Enable 🍊" enabled={enabled} onChange={setEnabled} />
      </div>
      <div>
        <RadioGroup options={fruitOptions} value={fruit} onChange={setFruit} />
      </div>
      <div>
        <RadioCardsGroup
          options={fruitOptions}
          value={fruit}
          onChange={(value) => value && setFruit(value)}
        />
      </div>
      <div className="h-4">
        <Progress percent={100 * (page / 5)} />
      </div>
      <div>
        <Pagination
          itemsPerPage={10}
          page={page}
          totalItems={42}
          onPageSelect={setPage}
        />
      </div>
      <div className="flex justify-between">
        <Button onClick={() => setShowModal(true)}>Open modal</Button>
        {showModal && (
          <Modal
            title="Modal"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            onClose={() => setShowModal(false)}
          >
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </Modal>
        )}
        <Menu
          items={[
            {
              label: "Banana",
              onClick: () => setFruit("banana"),
            },
            {
              label: "Apple",
              onClick: () => setFruit("apple"),
            },
            {
              label: "Orange",
              onClick: () => setFruit("orange"),
              disabled: !enabled,
            },
          ]}
        />
      </div>
    </div>
  );
};
