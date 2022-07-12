import { Api } from "@/Api";
import React, { ReactElement, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useQueryClient } from "react-query";
import IconButton from "./atoms/IconButton";
import Progress from "./atoms/Progress";

interface Props {
  pointId: string;
}

const ImageUploadButton = ({ pointId }: Props): ReactElement => {
  const [progress, setProgress] = useState<number>();
  const [, setError] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 1) {
        try {
          await Api.uploadImage(pointId, acceptedFiles[0], setProgress);
          queryClient.refetchQueries(["images", { resourceId: pointId }]);
          setProgress(undefined);
        } catch (error) {
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
    <div className="h-[2.125rem] w-[2.125rem]">
      <Progress percent={progress} />
    </div>
  ) : (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <IconButton loading={!!progress} icon="camera" />
    </div>
  );
};

export default ImageUploadButton;
