import { z } from 'zod';

// Helper functions for validation
const isValidDate = (date: Date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

const isAtLeast18YearsOld = (dateOfBirth: Date) => {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    return age - 1 >= 18;
  }

  return age >= 18;
};

// Applicant Details Schema
export const applicantDetailsSchema = z.object({
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

    return isValidDate(selectedDate) && selectedDateStart >= todayStart;
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
    return isValidDate(d) && isAtLeast18YearsOld(d);
  }, 'Applicant must be at least 18 years old'),

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
    const today = new Date();
    return isValidDate(d) && d <= today;
  }, 'Passport issue date cannot be in the future'),

  passportExpiryDate: z.string().refine(date => {
    const d = new Date(date);
    const today = new Date();
    return isValidDate(d) && d > today;
  }, 'Passport must be valid (not expired)'),
});

export type ApplicantDetailsFormData = z.infer<typeof applicantDetailsSchema>;
