import { Api } from "@/Api";
import { ActionIcon, Progress } from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { ReactElement, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  pointId: string;
}

const ImageUploadButton = ({ pointId }: Props): ReactElement => {
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(false);

      if (acceptedFiles.length === 1) {
        try {
          await Api.uploadImage(pointId, acceptedFiles[0], setProgress);
          queryClient.refetchQueries(["images", { resourceId: pointId }]);
          setProgress(undefined);
        } catch (error) {
          setProgress(undefined);
          setError(true);
        }
      }
    },
    [pointId]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/jpeg",
    maxFiles: 1,
  });

  return progress && progress < 100 ? (
    <div data-tailwind="h-[2.125rem] w-[2.125rem]">
      <Progress value={progress} animated />
    </div>
  ) : (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <ActionIcon loading={!!progress} color={error ? "red" : undefined}>
        <IconCamera size={14} />
      </ActionIcon>
    </div>
  );
};

export default ImageUploadButton;
