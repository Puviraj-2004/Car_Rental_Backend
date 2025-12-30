import { Client, product } from 'mindee';

interface ExtractedDocumentData {
  fullName?: string;
  documentId?: string;
  expiryDate?: string;
  birthDate?: string;
  address?: string;
}

class OCRService {
  private client: Client;

  constructor() {
    const apiKey = process.env.MINDEE_API_KEY;
    if (!apiKey) {
      throw new Error('MINDEE_API_KEY is not configured in environment variables');
    }

    this.client = new Client({ apiKey });
  }

  async extractDocumentData(fileBuffer: Buffer, documentType?: 'license' | 'id' | 'address'): Promise<ExtractedDocumentData> {
    try {
      console.log('🔍 Starting OCR processing with Mindee API...');

      // Load the document from buffer
      const inputSource = this.client.docFromBuffer(fileBuffer, 'document.jpg');

      // Use different Mindee models based on document type
      let apiResponse;

      switch (documentType) {
        case 'license':
          // Use EU Driver License model - fallback to receipt for now
          apiResponse = await this.client.parse(product.ReceiptV5, inputSource);
          return this.extractDriverLicenseData(apiResponse.document);

        case 'id':
          // Use French ID Card model - fallback to receipt for now
          apiResponse = await this.client.parse(product.ReceiptV5, inputSource);
          return this.extractIdCardData(apiResponse.document);

        case 'address':
          // Use Receipt/Invoice model for address proof
          apiResponse = await this.client.parse(product.ReceiptV5, inputSource);
          return this.extractAddressData(apiResponse.document);

        default:
          // Try to auto-detect using OCR - use receipt parsing
          apiResponse = await this.client.parse(product.ReceiptV5, inputSource);
          return this.extractGenericData(apiResponse.document);
      }

    } catch (error) {
      console.error('❌ Mindee OCR Error:', error);

      // If Mindee fails, return empty data instead of throwing error
      // This allows the frontend to handle gracefully
      console.log('⚠️ Mindee API failed, returning empty data for manual entry');
      return {};
    }
  }

  private extractDriverLicenseData(document: any): ExtractedDocumentData {
    try {
      const prediction = document.inference.prediction;

      return {
        fullName: prediction.driver_license_holder_name?.value ||
                  prediction.holder_name?.value ||
                  prediction.name?.value,
        documentId: prediction.driver_license_id?.value ||
                   prediction.license_number?.value ||
                   prediction.id_number?.value,
        expiryDate: prediction.expiry_date?.value ||
                   prediction.expiration_date?.value,
        birthDate: prediction.birth_date?.value ||
                  prediction.date_of_birth?.value
      };
    } catch (error) {
      console.error('Error extracting driver license data:', error);
      return {};
    }
  }

  private extractIdCardData(document: any): ExtractedDocumentData {
    try {
      const prediction = document.inference.prediction;

      return {
        fullName: prediction.name?.value ||
                  prediction.holder_name?.value ||
                  prediction.full_name?.value,
        documentId: prediction.id_number?.value ||
                   prediction.identification_number?.value ||
                   prediction.document_number?.value,
        birthDate: prediction.birth_date?.value ||
                  prediction.date_of_birth?.value ||
                  prediction.birthday?.value,
        address: prediction.address?.value ||
                 prediction.residence_address?.value
      };
    } catch (error) {
      console.error('Error extracting ID card data:', error);
      return {};
    }
  }

  private extractAddressData(document: any): ExtractedDocumentData {
    try {
      const prediction = document.inference.prediction;

      // Extract address information from receipt/invoice
      return {
        address: prediction.merchant_address?.value ||
                 prediction.customer_address?.value ||
                 prediction.supplier_address?.value ||
                 prediction.billing_address?.value,
        fullName: prediction.merchant_name?.value ||
                  prediction.supplier_name?.value
      };
    } catch (error) {
      console.error('Error extracting address data:', error);
      return {};
    }
  }

  private extractGenericData(document: any): ExtractedDocumentData {
    try {
      const prediction = document.inference.prediction;

      // Extract text from OCR and try to find relevant information
      const allText = prediction.all_text?.value || '';

      return {
        fullName: this.extractNameFromText(allText),
        documentId: this.extractDocumentIdFromText(allText),
        expiryDate: this.extractDateFromText(allText),
        birthDate: this.extractDateFromText(allText),
        address: this.extractAddressFromText(allText)
      };
    } catch (error) {
      console.error('Error extracting generic data:', error);
      return {};
    }
  }

  private extractNameFromText(text: string): string | undefined {
    // Simple name extraction - look for common name patterns
    const namePatterns = [
      /(?:name|nom|holder|owner)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:license|card|id)/i
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractDocumentIdFromText(text: string): string | undefined {
    // Look for license numbers, ID numbers, etc.
    const idPatterns = [
      /(?:license|lic|dl|id|card).*?[\s:]+([A-Z0-9\-]{6,})/i,
      /([A-Z]{1,3}[0-9]{6,})/, // Common license/ID format
      /(?:number|num|no).*?[\s:]+([A-Z0-9\-]{5,})/i
    ];

    for (const pattern of idPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractDateFromText(text: string): string | undefined {
    // Look for dates in various formats
    const datePatterns = [
      /(?:expir|exp|valid|expiry|expires).*?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
      /(?:birth|born|dob).*?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
      /(?:date).*?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g
    ];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const dateStr = match.replace(/[^\d\/\-\.]/g, '');
          if (this.isValidDate(dateStr)) {
            return this.formatDate(dateStr);
          }
        }
      }
    }

    return undefined;
  }

  private extractAddressFromText(text: string): string | undefined {
    // Look for address-like patterns
    const addressPatterns = [
      /(?:address|addr|location)[\s:]+([^\n\r]{10,80})/i,
      /(\d+\s+[A-Za-z0-9\s,.-]{10,})/
    ];

    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private isValidDate(dateStr: string): boolean {
    try {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
    } catch {
      return false;
    }
  }

  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateStr;
    }
  }
}

// Export singleton instance
export const ocrService = new OCRService();
export { ExtractedDocumentData };
