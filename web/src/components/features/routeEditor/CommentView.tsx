import DeleteDialog from "@/components/molecules/DeleteDialog";
import Restricted from "@/components/Restricted";
import { Comment } from "@/models/comment";
import { useDeleteComment, useUpdateComment } from "@/queries/commentQueries";
import { ActionIcon, Button, Menu, TextInput } from "@mantine/core";
import { IconEdit, IconMenu2, IconTrash } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

export const CommentView: FC<{ comment: Comment }> = ({ comment }) => {
  const [text, setText] = useState(comment.text);

  const [action, setAction] = useState<"delete" | "edit">();

  const deleteComment = useDeleteComment(comment.id);
  const updateComment = useUpdateComment(comment.id);

  useEffect(() => {
    if (updateComment.isSuccess) {
      setAction(undefined);
    }
  }, [updateComment.isSuccess]);

  return (
    <div className="flex flex-row justify-between gap-x-2">
      {action === "edit" ? (
        <div className="flex-grow flex flex-col gap-2">
          <TextInput
            label="Kommentar"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="flex flex-row gap-2 justify-start">
            <Button variant="subtle" onClick={() => setAction(undefined)}>
              Avbryt
            </Button>
            <Button
              onClick={() => updateComment.mutate({ ...comment, text })}
              loading={updateComment.isLoading}
            >
              Spara
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-grow w-0 text-sm italic">{comment.text}</div>
      )}
      {action === undefined && (
        <Restricted>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="light">
                <IconMenu2 size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => {
                  setAction("edit");
                  setText(comment.text);
                }}
              >
                Redigera
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => setAction("delete")}
              >
                Radera
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Restricted>
      )}
      {action === "delete" && (
        <DeleteDialog
          mutation={deleteComment}
          target="kommentaren"
          onClose={() => setAction(undefined)}
        />
      )}
    </div>
  );
};
