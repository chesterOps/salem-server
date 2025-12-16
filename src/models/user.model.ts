import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "First name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Email is invalid"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be at least 8 characters"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    methods: {
      // Verify password
      async verifyPassword(password: string, dbPassword: string) {
        return await bcrypt.compare(password, dbPassword);
      },

      // Check if password was changed after token was issued
      changedPasswordAfter(tokenTimestamp: number) {
        // Check for field
        if (this.passwordChangedAt) {
          // Get timestamp when password was changed
          const changedTimestamp = parseInt(
            (this.passwordChangedAt.getTime() / 1000).toString(),
            10
          );

          // Compare values
          return tokenTimestamp < changedTimestamp;
        }

        return false;
      },
    },
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Encrypt password on save
userSchema.pre("save", async function (next) {
  // Check if password field was modified
  if (!this.isModified("password") || !this.password) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Updating password changed time
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now());
  next();
});

// Create user model
const User = mongoose.model("User", userSchema);

export default User;
