import { Schema, model, models, Model, Types } from "mongoose";

// ─── Interfaces ───
// These define the shape of our data at the TypeScript level
// so we get type safety throughout the codebase

export interface ICleanedLink {
  original: string;
  cleaned: string;
  removedParams: string[];
}

export interface IFile {
  userId: Types.ObjectId;
  batchId: Types.ObjectId;
  originalName: string;
  fileType: "docx" | "doc" | "pdf" | "md" | "txt";
  fileSize: number;
  originalR2Key: string;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  cleanedR2Key?: string;
  cleanedName?: string;
  linksFound: number;
  linksCleaned: number;
  cleanedLinks?: ICleanedLink[];
  createdAt: Date;
  expiresAt: Date;
  purgedAt?: Date;
}

export interface IFileMethods {
  isExpired(): boolean;
  isPurged(): boolean;
  daysUntilExpiry(): number;
}

type FileModel = Model<IFile, {}, IFileMethods>;

// ─── Schema ───
// The Mongoose schema enforces structure at the database level
// and provides the bridge between MongoDB documents and our TypeScript types

const fileSchema = new Schema<IFile, FileModel, IFileMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users", // References Auth.js-managed users collection
      required: true,
      index: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    originalName: { type: String, required: true },
    fileType: {
      type: String,
      enum: ["docx", "doc", "pdf", "md", "txt"],
      required: true,
    },
    fileSize: { type: Number, required: true },
    originalR2Key: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    errorMessage: { type: String },
    cleanedR2Key: { type: String },
    cleanedName: { type: String },
    linksFound: { type: Number, default: 0 },
    linksCleaned: { type: Number, default: 0 },
    cleanedLinks: [
      {
        original: String,
        cleaned: String,
        removedParams: [String],
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      index: true, // Cron cleanup queries filter on this field
    },
    purgedAt: { type: Date },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
    methods: {
      isExpired() {
        return new Date() > this.expiresAt;
      },
      isPurged() {
        return this.purgedAt != null;
      },
      daysUntilExpiry() {
        const diff = this.expiresAt.getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },
    },
  }
);

// Compound index: efficiently query "all files for this user, newest first"
fileSchema.index({ userId: 1, createdAt: -1 });

export const FileModel =
  (models.File as FileModel | undefined) ??
  model<IFile, FileModel>("File", fileSchema);
