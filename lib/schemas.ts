import { z } from 'zod';

export const checkStatusSchema = z.object({
  applicationId: z
    .string()
    .min(1, 'Application ID is required')
    .regex(
      /^TUR-[A-Z0-9]{8,12}$/,
      'Please enter a valid application ID (e.g., TUR-A1B2C3D4)'
    ),
});

export type CheckStatusFormData = z.infer<typeof checkStatusSchema>;
