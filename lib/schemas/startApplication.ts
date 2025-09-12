import { z } from 'zod';

export const startApplicationSchema = z.object({
  passportCountry: z.string().min(1, 'Please select your passport country'),
  travelDocument: z.string().min(1, 'Travel document is required'),
  visaType: z.string().min(1, 'Visa type is required'),
  destination: z.string().min(1, 'Destination is required'),
  email: z.string().email('Please enter a valid email address'),
});

export type StartApplicationFormData = z.infer<typeof startApplicationSchema>;
