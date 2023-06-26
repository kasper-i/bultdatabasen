import { Dialog, Transition } from "@headlessui/react";
import React, { FC, Fragment } from "react";
import { ReactNode } from "react";

const Modal: FC<{
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}> = ({ children, onClose, title, description }) => {
  return (
    <Transition appear show>
      <Dialog className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen flex justify-center items-center">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-70"
            entered="opacity-70"
            leave="ease-in duration-200"
            leaveFrom="opacity-70"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black" />
          </Transition.Child>

          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="scale-95"
            enterTo="scale-100"
            leave="ease-in duration-200"
            leaveFrom="scale-100"
            leaveTo="scale-95"
          >
            <div className="inline-block p-5 my-8 mx-4 max-w-md overflow-hidden transition-all transform bg-white shadow-xl rounded-lg">
              <Dialog.Title
                as="h3"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 mb-4 text-md leading-tight">
                {description}
              </Dialog.Description>
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
