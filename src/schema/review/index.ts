import { z } from "zod";

export const createReviewSchema = z.object({
  medicineId: z.string().min(1, "Medicine ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(3, "Comment is too short"),
});

export type CREATE_REVIEW = z.infer<typeof createReviewSchema>;
