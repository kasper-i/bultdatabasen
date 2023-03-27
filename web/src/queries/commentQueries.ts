import { Comment } from "@/models/comment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../Api";

export const useComments = (resourceId: string) =>
  useQuery(["comments", { resourceId }], () => Api.getComments(resourceId));

export const useCreateComment = (resourceId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (comment: Comment) => Api.createComment(resourceId, comment),
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Comment[]>(
          ["comments", { resourceId }],
          (old) => (old === undefined ? [data] : [...old, data])
        );
      },
    }
  );
};

export const useUpdateComment = (commentId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (comment: Comment) => Api.updateComment(commentId, comment),
    {
      onSuccess: (data) => {
        queryClient.setQueriesData<Comment[]>(
          { queryKey: ["comments"], exact: false },
          (old) =>
            old === undefined
              ? undefined
              : old.map((existingComment) =>
                  existingComment.id === commentId ? data : existingComment
                )
        );
      },
    }
  );
};

export const useDeleteComment = (commentId: string) => {
  const queryClient = useQueryClient();

  return useMutation(() => Api.deleteComment(commentId), {
    onSuccess: () => {
      queryClient.setQueriesData<Comment[]>(
        { queryKey: ["comments"], exact: false },
        (old) =>
          old === undefined
            ? undefined
            : old.filter((comment) => comment.id !== commentId)
      );
    },
  });
};
