import { Document, Schema, model } from 'mongoose';

import { FILES } from '../utils/constants/model-names';

// Interface for the File document
export interface IFile extends Document {
  path: string;
}

// Define the File schema
export const FileSchema = new Schema<IFile>(
  {
    path: { type: String, required: true },
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
  },
);

// Create the File model
export const FileModel = model<IFile>(FILES, FileSchema);
