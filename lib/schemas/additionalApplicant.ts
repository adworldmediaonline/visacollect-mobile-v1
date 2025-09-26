import { z } from 'zod';

// Supporting Document Schema (matches backend validation)
const supportingDocumentSchema = z
  .object({
    documentType: z.enum([
      'Visa',
      'Residence Permit',
      'visa',
      'residence-permit',
    ]),
    issuingCountry: z.string().min(1, 'Issuing country is required'),
    documentNumber: z.string().min(1, 'Document number is required'),
    expiryDate: z.string().optional(),
    isUnlimited: z.boolean().default(false),
  })
  .refine(
    data => {
      // If isUnlimited is false, expiryDate is required
      if (!data.isUnlimited && !data.expiryDate) {
        return false;
      }
      // If isUnlimited is true, expiryDate should not be provided
      if (data.isUnlimited && data.expiryDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Expiry date is required when validity is not unlimited',
      path: ['expiryDate'],
    }
  );

// Additional Applicant Schema (matches backend validation)
export const additionalApplicantSchema = z.object({
  arrivalDate: z.string().refine(date => {
    const selectedDate = new Date(date);
    const today = new Date();

    // Set both dates to start of day for fair comparison
    const selectedDateStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return !isNaN(selectedDate.getTime()) && selectedDateStart >= todayStart;
  }, 'Arrival date must be today or in the future'),

  givenNames: z
    .string()
    .min(1, 'Given names are required')
    .max(100, 'Given names are too long')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Given names can only contain letters, spaces, hyphens, and apostrophes'
    ),

  surname: z
    .string()
    .min(1, 'Surname is required')
    .max(100, 'Surname is too long')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Surname can only contain letters, spaces, hyphens, and apostrophes'
    ),

  dateOfBirth: z.string().refine(date => {
    const d = new Date(date);
    return (
      !isNaN(d.getTime()) && d <= new Date() && d >= new Date('1900-01-01')
    );
  }, 'Please enter a valid date of birth'),

  placeOfBirth: z
    .string()
    .min(1, 'Place of birth is required')
    .max(100, 'Place of birth is too long'),

  motherName: z
    .string()
    .min(1, "Mother's name is required")
    .max(100, "Mother's name is too long")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Mother's name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  fatherName: z
    .string()
    .min(1, "Father's name is required")
    .max(100, "Father's name is too long")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Father's name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  passportNumber: z
    .string()
    .min(1, 'Passport number is required')
    .max(20, 'Passport number is too long')
    .regex(
      /^[A-Z0-9]+$/,
      'Passport number can only contain uppercase letters and numbers'
    ),

  passportIssueDate: z.string().refine(date => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && d <= new Date();
  }, 'Passport issue date cannot be in the future'),

  passportExpiryDate: z.string().refine(date => {
    const d = new Date(date);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);
    return !isNaN(d.getTime()) && d > new Date() && d <= maxDate;
  }, 'Passport expiry date must be in the future and not more than 10 years from now'),

  documents: z.object({
    supportingDocuments: z
      .array(supportingDocumentSchema)
      .min(1, 'At least one supporting document is required'),
    additionalDocuments: z.array(z.any()).optional(),
  }),
});

export type AdditionalApplicantFormData = z.infer<
  typeof additionalApplicantSchema
>;
