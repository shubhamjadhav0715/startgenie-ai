import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: "" },
    emailVerificationExpiresAt: { type: String, default: "" },
    googleSub: { type: String, default: "" },
    about: { type: String, default: "" },
    allowAnalytics: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    createdAt: { type: String, default: "" },
  },
  { versionKey: false }
);

const chatSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, default: "" },
    messages: { type: [Schema.Types.Mixed], default: [] },
    createdAt: { type: String, default: "" },
    updatedAt: { type: String, default: "" },
  },
  { versionKey: false }
);

const libraryFileSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, default: "" },
    type: { type: String, default: "" },
    prompt: { type: String, default: "" },
    url: { type: String, default: "" },
    createdAt: { type: String, default: "" },
  },
  { versionKey: false, strict: false }
);

const blueprintSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    idea: { type: String, default: "" },
    location: { type: String, default: "" },
    category: { type: String, default: "" },
    budget: { type: String, default: "" },
    unit: { type: String, default: "" },
    extraContext: { type: String, default: "" },
    qa: { type: [Schema.Types.Mixed], default: [] },
    structured: { type: Schema.Types.Mixed, default: null },
    retrievedKnowledge: { type: Schema.Types.Mixed, default: null },
    blueprintVisual: { type: Schema.Types.Mixed, default: null },
    status: { type: String, default: "" },
    createdAt: { type: String, default: "" },
  },
  { versionKey: false, strict: false }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
export const LibraryFile =
  mongoose.models.LibraryFile || mongoose.model("LibraryFile", libraryFileSchema);
export const Blueprint =
  mongoose.models.Blueprint || mongoose.model("Blueprint", blueprintSchema);

export async function connectMongo() {
  const uri = String(process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it in backend/.env to connect MongoDB Atlas.");
  }

  if (mongoose.connection.readyState === 1) return;

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);

  // If this Atlas database was reused from another project, it may contain
  // incompatible unique indexes (e.g. `users.username`), which break inserts
  // because this app doesn't set that field.
  try {
    const indexes = await User.collection.indexes();
    const hasUsernameUnique = indexes.some((idx) => idx?.name === "username_1");
    if (hasUsernameUnique) {
      await User.collection.dropIndex("username_1");
    }
  } catch {
    // Ignore index cleanup failures (insufficient permissions, etc.).
  }
}
