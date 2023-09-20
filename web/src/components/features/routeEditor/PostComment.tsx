import { useCreateComment } from "@/queries/commentQueries";
import { Button, Textarea, TextInput } from "@mantine/core";
import { FC, useEffect, useState } from "react";

export const PostComment: FC<{ parentResourceId: string }> = ({
  parentResourceId,
}) => {
  const [comment, setComment] = useState("");

  const postComment = useCreateComment(parentResourceId);

  useEffect(() => {
    if (postComment.isSuccess) {
      setComment("");
    }
  }, [postComment.isSuccess]);

  return (
    <div className="flex flex-row gap-x-2">
      <Textarea
        placeholder="Kommentar"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        loading={postComment.isLoading}
        onClick={() => postComment.mutate({ text: comment, tags: [] })}
        disabled={!comment}
      >
        Posta
      </Button>
    </div>
  );
};
