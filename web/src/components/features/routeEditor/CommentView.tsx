import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import DeleteDialog from "@/components/molecules/DeleteDialog";
import { Menu } from "@/components/molecules/Menu";
import Restricted from "@/components/Restricted";
import { Comment } from "@/models/comment";
import { useDeleteComment, useUpdateComment } from "@/queries/commentQueries";
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
    <div className="rounded-sm cursor-pointer flex flex-row justify-between gap-x-2">
      {action === "edit" ? (
        <div className="flex-grow flex flex-col gap-2">
          <Input
            label="Kommentar"
            value={text}
            onChange={(e) => setText(e.target.value)}
            labelStyle="none"
          />
          <div className="flex flex-row gap-2 justify-start">
            <Button outlined onClick={() => setAction(undefined)}>
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
          <Menu
            items={[
              {
                label: "Redigera",
                onClick: () => {
                  setAction("edit");
                  setText(comment.text);
                },
                icon: "edit",
              },
              {
                label: "Radera",
                onClick: () => setAction("delete"),
                icon: "trash",
                className: "text-red-500",
              },
            ]}
          />
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
