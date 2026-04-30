import { Schema, model, models, Model, Types } from "mongoose";

// ─── Interfaces ───

export interface IBatch {
  userId: Types.ObjectId;
  totalFiles: number;
  status: "pending" | "processing" | "completed" | "partial" | "failed";
  createdAt: Date;
  expiresAt: Date;
}

export interface IBatchMethods {
  isComplete(): boolean;
}

type BatchModel = Model<IBatch, {}, IBatchMethods>;

// ─── Schema ───
// Batches group multiple files together so the UI can show
// "you uploaded 3 files and we cleaned 42 links" as one operation

const batchSchema = new Schema<IBatch, BatchModel, IBatchMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    totalFiles: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "partial", "failed"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true, // Cron cleanup queries filter on this
    },
  },
  {
    timestamps: true,
    methods: {
      isComplete() {
        return this.status === "completed";
      },
    },
  }
);

// Compound index: user's batches sorted by creation date
batchSchema.index({ userId: 1, createdAt: -1 });

export const BatchModel =
  (models.Batch as BatchModel | undefined) ??
  model<IBatch, BatchModel>("Batch", batchSchema);
