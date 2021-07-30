import { Api } from "Api";
import { queryClient } from "index";
import React, { ReactElement, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Icon, Progress } from "semantic-ui-react";

interface Props {
  pointId: string;
}

const ImageDropzone = ({ pointId }: Props): ReactElement => {
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
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

  return (
    <div
      className="flex flex-col justify-start"
      style={{ width: 160, height: 120 }}
    >
      {progress ? (
        <Progress
          percent={progress}
          progress
          error={error}
          success={progress === 100}
        />
      ) : (
        <div
          {...getRootProps()}
          className="h-full border-gray-200 border-dashed border-4 flex justify-center items-center cursor-pointer rounded"
        >
          <input {...getInputProps()} />
          {<Icon name="upload" size="big" className="text-gray-500" />}
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
