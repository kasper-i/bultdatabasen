import { Api } from "@/Api";
import React, { ReactElement, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useQueryClient } from "react-query";
import Icon from "./base/Icon";
import Progress from "./base/Progress";

interface Props {
  pointId: string;
}

const ImageDropzone = ({ pointId }: Props): ReactElement => {
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState(false);
  const queryClient = useQueryClient();

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
    <div className="flex flex-col justify-start w-full h-[120px]">
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
          className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
        >
          <input {...getInputProps()} />
          <div className="space-y-1 text-center">
            <Icon name="upload" className="text-gray-500" />
            <div className="flex text-sm text-gray-600">
              <p className="cursor-pointer font-medium">
                <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  Ladda upp fil
                </span>
                <span className="pl-1">eller dra och släpp</span>
              </p>
            </div>
            <p className="text-xs text-gray-500">JPG upp till 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
