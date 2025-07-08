import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";

// Configuration simple pour UploadThing
export const { UploadButton, UploadDropzone, Uploader } = generateComponents();

export const { useUploadThing, uploadFiles } = generateReactHelpers(); 