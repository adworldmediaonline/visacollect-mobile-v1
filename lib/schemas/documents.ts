import { z } from 'zod';

// Supporting Documents Schema (matches backend validation)
export const supportingDocumentSchema = z
  .object({
    documentType: z.enum(
      ['Visa', 'Residence Permit', 'visa', 'residence-permit'],
      {
        message: 'Invalid document type selected',
      }
    ),

    issuingCountry: z
      .string()
      .min(1, 'Issuing country is required')
      .max(100, 'Issuing country name is too long'),

    documentNumber: z
      .string()
      .min(1, 'Document number is required')
      .max(50, 'Document number is too long'),

    expiryDate: z.string().optional(),
    isUnlimited: z.boolean().default(false),
  })
  .refine(
    data => {
      // If not unlimited, expiry date is required
      if (!data.isUnlimited && !data.expiryDate) {
        return false;
      }
      // If unlimited, expiry date should not be provided
      if (data.isUnlimited && data.expiryDate) {
        return false;
      }
      // If expiry date is provided, it should be valid
      if (data.expiryDate) {
        const d = new Date(data.expiryDate);
        return !isNaN(d.getTime());
      }
      return true;
    },
    {
      message: 'Expiry date is required unless document has unlimited validity',
      path: ['expiryDate'],
    }
  );

// Document Upload Schema (matches backend validation)
export const documentUploadSchema = z
  .object({
    supportingDocuments: z
      .array(supportingDocumentSchema)
      .max(5, 'Maximum 5 supporting documents allowed')
      .default([]),

    additionalDocuments: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, 'Document name is required')
            .max(100, 'Document name is too long'),
          url: z.string().url('Invalid document URL'),
          publicId: z.string().optional(),
          uploadedAt: z.string().optional(),
          size: z.number().optional(),
          format: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
      )
      .max(10, 'Maximum 10 additional documents allowed')
      .default([]),
  })
  .refine(
    data => {
      // At least one type of document must be provided
      const hasSupportingDocs =
        data.supportingDocuments && data.supportingDocuments.length > 0;
      const hasAdditionalDocs =
        data.additionalDocuments && data.additionalDocuments.length > 0;

      return hasSupportingDocs || hasAdditionalDocs;
    },
    {
      message: 'At least one document (supporting or additional) is required',
      path: ['supportingDocuments'],
    }
  );

export type SupportingDocumentFormData = z.infer<
  typeof supportingDocumentSchema
>;
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
