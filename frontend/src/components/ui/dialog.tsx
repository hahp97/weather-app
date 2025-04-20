"use client";

import { cn } from "@/utils/common";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import * as React from "react";
import { Fragment } from "react";

const Dialog = ({
  children,
  open,
  onOpenChange,
  ...props
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="relative z-50"
        onClose={() => onOpenChange(false)}
        {...props}
      >
        {children}
      </HeadlessDialog>
    </Transition>
  );
};

// Simple button trigger that can be used to open the dialog
const DialogTrigger = ({
  className,
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200",
        "text-gray-700 hover:text-gray-900 focus:outline-none",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const DialogContent = ({
  className,
  children,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  onClose?: () => void;
}) => {
  return (
    <>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel
              className={cn(
                "w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all",
                "border border-gray-200",
                className
              )}
              {...props}
            >
              {children}
              {onClose && (
                <button
                  type="button"
                  className="absolute right-4 top-4 rounded-full p-1.5 bg-gray-100 text-gray-500 opacity-70 transition-all hover:bg-gray-200 hover:opacity-100 focus:outline-none"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              )}
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </>
  );
};

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left mb-5",
      className
    )}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-6 pt-3 border-t border-gray-100",
      className
    )}
    {...props}
  />
);

const DialogTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <HeadlessDialog.Title
    as="h3"
    className={cn(
      "text-lg font-semibold leading-6 tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
);

const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <HeadlessDialog.Description
    className={cn("text-sm text-gray-500 mt-1", className)}
    {...props}
  />
);

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
