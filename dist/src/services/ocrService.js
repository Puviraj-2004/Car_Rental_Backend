"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrService = void 0;
const mindee_1 = require("mindee");
// Define confidence threshold for reliable OCR results
const CONFIDENCE_THRESHOLD = 0.7;
class OCRService {
    client;
    constructor() {
        const apiKey = process.env.MINDEE_API_KEY;
        if (!apiKey) {
            throw new Error('MINDEE_API_KEY is not configured in environment variables');
        }
        this.client = new mindee_1.Client({ apiKey });
    }
    // Enhanced helper methods for extracting data from receipt OCR
    // Extract names from various receipt fields
    extractNameFromReceipt(prediction) {
        // Look for names in supplier/customer fields
        const nameFields = [
            prediction.supplier_name?.value,
            prediction.merchant_name?.value,
            prediction.customer_name?.value
        ].filter(Boolean);
        for (const name of nameFields) {
            // Validate as a proper name (First Last format)
            if (name && /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name.trim())) {
                return name.trim();
            }
        }
        // Look in line items for names
        if (prediction.line_items) {
            for (const item of prediction.line_items) {
                const description = item.description?.value;
                if (description) {
                    const nameMatch = description.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
                    if (nameMatch && nameMatch[1]) {
                        return nameMatch[1];
                    }
                }
            }
        }
        return undefined;
    }
    async extractDocumentData(fileBuffer, documentType) {
        try {
            console.log('🔍 Starting OCR processing with Mindee API...');
            // Load the document from buffer
            const inputSource = this.client.docFromBuffer(fileBuffer, 'document.jpg');
            // Use Mindee OCR for document processing
            // Currently using ReceiptV5 as a generic OCR model for all document types
            // TODO: Implement specific models when available (eu.DriverLicenseV1, fr.IdCardV2, etc.)
            let apiResponse;
            try {
                // Use specific Mindee document models for accurate extraction
                console.log(`🔍 Processing ${documentType} with specific Mindee document models`);
                switch (documentType) {
                    case 'license':
                        // Use EU Driver License V1 model for accurate license data extraction
                        console.log('📄 Using EU Driver License V1 model for license OCR');
                        apiResponse = await this.client.parse(mindee_1.product.DriverLicenseV1, inputSource);
                        break;
                    case 'id':
                        // Use French ID Card V2 model for accurate ID data extraction
                        console.log('🆔 Using French ID Card V2 model for ID OCR');
                        apiResponse = await this.client.parse(mindee_1.product.fr.IdCardV2, inputSource);
                        break;
                    case 'address':
                        // Use Invoice V4 model for better address proof extraction (bills, invoices)
                        console.log('🏠 Using Invoice V4 model for address proof OCR');
                        apiResponse = await this.client.parse(mindee_1.product.InvoiceV4, inputSource);
                        break;
                    default:
                        // Fallback to generic OCR
                        console.log('📋 Using generic OCR for unknown document type');
                        apiResponse = await this.client.parse(mindee_1.product.ReceiptV5, inputSource);
                }
                // Route to appropriate enhanced extraction based on document type
                switch (documentType) {
                    case 'license':
                        return this.extractDriverLicenseData(apiResponse.document);
                    case 'id':
                        return this.extractIdCardData(apiResponse.document);
                    case 'address':
                        return this.extractAddressData(apiResponse.document);
                    default:
                        return this.extractGenericData(apiResponse.document);
                }
            }
            catch (error) {
                console.error(`❌ Mindee OCR Error for ${documentType}:`, error);
                // Return empty strings instead of undefined/null to prevent frontend crashes
                console.log('⚠️ Mindee API failed, returning empty strings for manual entry');
                return {
                    fullName: '',
                    documentId: '',
                    expiryDate: '',
                    birthDate: '',
                    address: ''
                };
            }
        }
        catch (error) {
            console.error('❌ Mindee OCR Error:', error);
            // If Mindee fails, return empty strings instead of undefined/null to prevent frontend crashes
            console.log('⚠️ Mindee API failed, returning empty strings for manual entry');
            return {
                fullName: '',
                documentId: '',
                expiryDate: '',
                birthDate: '',
                address: ''
            };
        }
    }
    // Enhanced license number extraction from receipt OCR
    extractLicenseNumberFromText(prediction) {
        // Look for license number patterns in all available text fields
        const textFields = [
            prediction.supplier_name?.value,
            prediction.merchant_name?.value,
            prediction.customer_name?.value,
            prediction.total_amount?.value,
            prediction.invoice_number?.value,
            prediction.supplier_address?.value,
            prediction.customer_address?.value
        ].filter(Boolean);
        // Also check line items for license numbers
        if (prediction.line_items) {
            for (const item of prediction.line_items) {
                if (item.description?.value) {
                    textFields.push(item.description.value);
                }
            }
        }
        for (const text of textFields) {
            // Comprehensive license number patterns for different formats
            const licensePatterns = [
                /\b([A-Z]{1,3}\d{6,12})\b/, // e.g., ABC123456, DL123456789
                /\b(\d{8,12})\b/, // e.g., 12345678, 9876543210
                /\b([A-Z]{2}\d{6,10})\b/, // e.g., AB123456, DL1234567
                /\b([A-Z]\d{7,11})\b/, // e.g., A12345678, D123456789
                /\b(LIC|LICENCE|LICENSE)[\s:]+([A-Z0-9]{6,15})\b/i, // e.g., LIC ABC123456
                /\b(DL|DRIVER)[\s:]+([A-Z0-9]{6,15})\b/i, // e.g., DL ABC123456
            ];
            for (const pattern of licensePatterns) {
                const match = text.match(pattern);
                if (match) {
                    // Return the captured group if available, otherwise the full match
                    return match[2] || match[1] || match[0];
                }
            }
        }
        return undefined;
    }
    // Enhanced date extraction from receipt OCR
    extractDateFromText(prediction) {
        const textFields = [
            prediction.date?.value,
            prediction.invoice_date?.value,
            prediction.due_date?.value,
            prediction.supplier_name?.value,
            prediction.merchant_name?.value,
            prediction.customer_name?.value
        ].filter(Boolean);
        // Also check line items for dates
        if (prediction.line_items) {
            for (const item of prediction.line_items) {
                if (item.description?.value) {
                    textFields.push(item.description.value);
                }
            }
        }
        for (const text of textFields) {
            // Comprehensive date patterns
            const datePatterns = [
                /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/, // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
                /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/, // YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD
                /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2})/, // DD/MM/YY, DD-MM-YY, DD.MM.YY
                /\b(EXP|EXPIRY|EXPIRES|VALID)[\s:]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/i, // EXP 12/31/2024
                /\b(DOB|BIRTH|BORN)[\s:]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/i, // DOB 01/15/1990
            ];
            for (const pattern of datePatterns) {
                const match = text.match(pattern);
                if (match) {
                    // Return the captured group if available (for labeled dates), otherwise the full match
                    const dateStr = match[2] || match[1] || match[0];
                    // Basic validation - ensure it looks like a date
                    if (this.isValidDateFormat(dateStr)) {
                        return dateStr;
                    }
                }
            }
        }
        return undefined;
    }
    // Helper method to validate date format
    isValidDateFormat(dateStr) {
        // Simple validation for common date formats
        const datePattern = /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})$/;
        return datePattern.test(dateStr);
    }
    // Enhanced ID number extraction from receipt OCR
    extractIdNumberFromText(prediction) {
        // Look for ID number patterns in all available text fields
        const textFields = [
            prediction.supplier_name?.value,
            prediction.merchant_name?.value,
            prediction.customer_name?.value,
            prediction.invoice_number?.value,
            prediction.total_amount?.value,
            prediction.supplier_address?.value,
            prediction.customer_address?.value
        ].filter(Boolean);
        // Also check line items for ID numbers
        if (prediction.line_items) {
            for (const item of prediction.line_items) {
                if (item.description?.value) {
                    textFields.push(item.description.value);
                }
            }
        }
        for (const text of textFields) {
            // Comprehensive ID card number patterns
            const idPatterns = [
                /\b(\d{10,15})\b/, // 10-15 digit numbers (common ID length)
                /\b([A-Z]{1,2}\d{8,12})\b/, // Letter + numbers (e.g., A123456789)
                /\b(\d{2}[A-Z]{2}\d{6,10})\b/, // Mixed pattern (e.g., 12AB123456)
                /\b(ID|CARD|IDENTITY)[\s:]+([A-Z0-9]{8,15})\b/i, // e.g., ID ABC123456789
                /\b(PASSPORT|PASSPORTNO)[\s:]+([A-Z0-9]{6,12})\b/i, // e.g., PASSPORT ABC123456
            ];
            for (const pattern of idPatterns) {
                const match = text.match(pattern);
                if (match) {
                    // Return the captured group if available, otherwise the full match
                    return match[2] || match[1] || match[0];
                }
            }
        }
        return undefined;
    }
    // Helper method to extract expiry dates from text
    extractExpiryDateFromText(prediction) {
        // Look for expiry indicators in line items
        if (prediction.line_items) {
            for (const item of prediction.line_items) {
                const description = item.description?.value;
                if (description) {
                    // Look for expiry date indicators
                    if (description.toLowerCase().includes('expiry') ||
                        description.toLowerCase().includes('expires') ||
                        description.toLowerCase().includes('valid')) {
                        const dateMatch = description.match(/(\d{2}[-\/]\d{2}[-\/]\d{4})/);
                        if (dateMatch && dateMatch[1]) {
                            return dateMatch[1];
                        }
                    }
                }
            }
        }
        return this.extractDateFromText(prediction);
    }
    // Helper method to extract birth dates from text
    extractBirthDateFromText(prediction) {
        // Birth dates are harder to identify, look for dates in descriptions
        if (prediction.line_items) {
            for (const item of prediction.line_items) {
                const description = item.description?.value;
                if (description) {
                    // Look for birth date indicators
                    if (description.toLowerCase().includes('birth') ||
                        description.toLowerCase().includes('dob') ||
                        description.toLowerCase().includes('born') ||
                        description.toLowerCase().includes('naissance')) {
                        const dateMatch = description.match(/(\d{2}[-\/]\d{2}[-\/]\d{4})/);
                        if (dateMatch && dateMatch[1]) {
                            return dateMatch[1];
                        }
                    }
                }
            }
        }
        return undefined;
    }
    extractDriverLicenseData(document) {
        try {
            const prediction = document.inference.prediction;
            // Extract data from Driver License V1 model with confidence checking
            let fullName = '';
            let documentId = '';
            let expiryDate = '';
            let birthDate = '';
            let address = '';
            // Map Driver License V1 fields: firstName, lastName, licenseNumber, expiryDate
            if (prediction.firstName && prediction.firstName.confidence > CONFIDENCE_THRESHOLD) {
                const firstName = prediction.firstName.value || '';
                if (prediction.lastName && prediction.lastName.confidence > CONFIDENCE_THRESHOLD) {
                    const lastName = prediction.lastName.value || '';
                    fullName = `${firstName} ${lastName}`.trim();
                }
                else {
                    fullName = firstName;
                }
                console.log(`✅ Driver License - High confidence name: ${fullName}`);
            }
            // Try license ID first, then DD number as fallback for licenseNumber
            if (prediction.id && prediction.id.confidence > CONFIDENCE_THRESHOLD) {
                documentId = prediction.id.value || '';
                console.log(`✅ Driver License - High confidence license number: ${documentId}`);
            }
            else if (prediction.ddNumber && prediction.ddNumber.confidence > CONFIDENCE_THRESHOLD) {
                documentId = prediction.ddNumber.value || '';
                console.log(`✅ Driver License - High confidence DD number: ${documentId}`);
            }
            if (prediction.expiryDate && prediction.expiryDate.confidence > CONFIDENCE_THRESHOLD) {
                expiryDate = prediction.expiryDate.value || '';
                console.log(`✅ Driver License - High confidence expiry date: ${expiryDate}`);
            }
            // Return empty strings for unmapped fields (birthDate, address)
            birthDate = '';
            address = '';
            // If we don't have high-confidence data from EU Driver License model, try enhanced fallback
            if (!fullName || !documentId) {
                console.log('⚠️ Low confidence from EU Driver License model, using enhanced fallback analysis');
                // Enhanced fallback extraction using receipt-style analysis
                if (!fullName) {
                    fullName = this.extractNameFromReceipt(prediction) ||
                        prediction.supplier_name?.value ||
                        prediction.merchant_name?.value ||
                        prediction.customer_name?.value || '';
                    // Additional extraction from line items for names
                    if (!fullName && prediction.line_items) {
                        for (const item of prediction.line_items) {
                            if (item.description?.value) {
                                const nameMatch = item.description.value.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
                                if (nameMatch && nameMatch[1]) {
                                    fullName = nameMatch[1];
                                    console.log(`✅ Extracted name from line item: ${fullName}`);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!documentId) {
                    documentId = this.extractLicenseNumberFromText(prediction) ||
                        prediction.total_amount?.value || '';
                }
                if (!expiryDate) {
                    expiryDate = this.extractExpiryDateFromText(prediction) ||
                        this.extractDateFromText(prediction) || '';
                }
                if (!birthDate) {
                    birthDate = this.extractBirthDateFromText(prediction) || '';
                }
                if (!address) {
                    address = this.extractAddressFromText(prediction) || '';
                }
            }
            // Ensure we return empty strings instead of null/undefined to prevent frontend crashes
            const result = {
                fullName: fullName || '',
                documentId: documentId || '',
                expiryDate: expiryDate || '',
                birthDate: birthDate || '',
                address: address || ''
            };
            // Log final extracted data for debugging
            console.log('📋 Driver License Final OCR Results:', {
                fullName: result.fullName ? `✅ ${result.fullName}` : '❌ Empty',
                documentId: result.documentId ? `✅ ${result.documentId}` : '❌ Empty',
                expiryDate: result.expiryDate ? `✅ ${result.expiryDate}` : '❌ Empty',
                birthDate: result.birthDate ? `✅ ${result.birthDate}` : '❌ Empty',
                address: result.address ? `✅ ${result.address}` : '❌ Empty'
            });
            return result;
        }
        catch (error) {
            console.error('Error extracting driver license data:', error);
            // Return empty strings to prevent frontend crashes
            return {
                fullName: '',
                documentId: '',
                expiryDate: '',
                birthDate: '',
                address: ''
            };
        }
    }
    extractIdCardData(document) {
        try {
            const prediction = document.inference.prediction;
            // Extract data from ID Card models (French ID V2 or International ID V2)
            let fullName = '';
            let documentId = '';
            let birthDate = '';
            let expiryDate = '';
            let address = '';
            // Map French ID Card V2 fields: firstName, lastName, idNumber, birthDate
            if (prediction.givenNames && prediction.givenNames.length > 0 &&
                prediction.givenNames[0].confidence > CONFIDENCE_THRESHOLD) {
                const firstName = prediction.givenNames[0].value || '';
                if (prediction.surname && prediction.surname.confidence > CONFIDENCE_THRESHOLD) {
                    const lastName = prediction.surname.value || '';
                    fullName = `${firstName} ${lastName}`.trim();
                }
                else {
                    fullName = firstName;
                }
                console.log(`✅ French ID Card - High confidence name: ${fullName}`);
            }
            if (prediction.documentNumber && prediction.documentNumber.confidence > CONFIDENCE_THRESHOLD) {
                documentId = prediction.documentNumber.value || '';
                console.log(`✅ French ID Card - High confidence ID number: ${documentId}`);
            }
            if (prediction.birthDate && prediction.birthDate.confidence > CONFIDENCE_THRESHOLD) {
                birthDate = prediction.birthDate.value || '';
                console.log(`✅ French ID Card - High confidence birth date: ${birthDate}`);
            }
            // Return empty string for unmapped field (expiryDate)
            expiryDate = '';
            // Try address from both models
            if (prediction.birthPlace && prediction.birthPlace.confidence > CONFIDENCE_THRESHOLD) {
                address = prediction.birthPlace.value || '';
                console.log(`✅ French ID Card - High confidence birth place: ${address} (${prediction.birthPlace.confidence})`);
            }
            else if (prediction.address && prediction.address.confidence > CONFIDENCE_THRESHOLD) {
                address = prediction.address.value || '';
                console.log(`✅ International ID - High confidence address: ${address} (${prediction.address.confidence})`);
            }
            // If we don't have high-confidence data from French ID Card model, use enhanced fallback
            if (!fullName || !documentId) {
                console.log('⚠️ Low confidence from French ID Card model, using enhanced fallback analysis');
                // Enhanced fallback extraction
                if (!fullName) {
                    fullName = this.extractNameFromReceipt(prediction) ||
                        prediction.supplier_name?.value ||
                        prediction.merchant_name?.value ||
                        prediction.customer_name?.value || '';
                    // Additional extraction from line items for names
                    if (!fullName && prediction.line_items) {
                        for (const item of prediction.line_items) {
                            if (item.description?.value) {
                                const nameMatch = item.description.value.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
                                if (nameMatch && nameMatch[1]) {
                                    fullName = nameMatch[1];
                                    console.log(`✅ Extracted name from line item: ${fullName}`);
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!documentId) {
                    documentId = this.extractIdNumberFromText(prediction) || '';
                }
                if (!birthDate) {
                    birthDate = this.extractBirthDateFromText(prediction) ||
                        this.extractDateFromText(prediction) || '';
                }
                if (!expiryDate) {
                    expiryDate = this.extractExpiryDateFromText(prediction) || '';
                }
                if (!address) {
                    address = this.extractAddressFromText(prediction) ||
                        prediction.supplier_address?.value ||
                        prediction.customer_address?.value ||
                        prediction.merchant_address?.value || '';
                }
            }
            // Ensure we return empty strings instead of null/undefined to prevent frontend crashes
            const result = {
                fullName: fullName || '',
                documentId: documentId || '',
                birthDate: birthDate || '',
                expiryDate: expiryDate || '',
                address: address || ''
            };
            // Log extracted data for debugging
            console.log('🆔 ID Card OCR Results:', {
                fullName: result.fullName ? `✅ ${result.fullName}` : '❌ Empty',
                documentId: result.documentId ? `✅ ${result.documentId}` : '❌ Empty',
                birthDate: result.birthDate ? `✅ ${result.birthDate}` : '❌ Empty',
                expiryDate: result.expiryDate ? `✅ ${result.expiryDate}` : '❌ Empty',
                address: result.address ? `✅ ${result.address}` : '❌ Empty'
            });
            return result;
        }
        catch (error) {
            console.error('Error extracting ID card data:', error);
            // Return empty strings to prevent frontend crashes
            return {
                fullName: '',
                documentId: '',
                birthDate: '',
                expiryDate: '',
                address: ''
            };
        }
    }
    extractAddressData(document) {
        try {
            const prediction = document.inference.prediction;
            // Extract address and document date from InvoiceV4 for better address proof processing
            let address = '';
            let fullName = '';
            let documentId = '';
            let expiryDate = '';
            // InvoiceV4 has better address fields
            if (prediction.customerAddress && prediction.customerAddress.confidence > CONFIDENCE_THRESHOLD) {
                address = prediction.customerAddress.value || '';
                console.log(`✅ Invoice - High confidence customer address: ${address}`);
            }
            else if (prediction.supplierAddress && prediction.supplierAddress.confidence > CONFIDENCE_THRESHOLD) {
                address = prediction.supplierAddress.value || '';
                console.log(`✅ Invoice - High confidence supplier address: ${address}`);
            }
            else if (prediction.billingAddress && prediction.billingAddress.confidence > CONFIDENCE_THRESHOLD) {
                address = prediction.billingAddress.value || '';
                console.log(`✅ Invoice - High confidence billing address: ${address}`);
            }
            if (prediction.customerName && prediction.customerName.confidence > CONFIDENCE_THRESHOLD) {
                fullName = prediction.customerName.value || '';
                console.log(`✅ Invoice - High confidence customer name: ${fullName}`);
            }
            else if (prediction.supplierName && prediction.supplierName.confidence > CONFIDENCE_THRESHOLD) {
                fullName = prediction.supplierName.value || '';
                console.log(`✅ Invoice - High confidence supplier name: ${fullName}`);
            }
            // Use invoice number as document ID
            if (prediction.invoiceNumber && prediction.invoiceNumber.confidence > CONFIDENCE_THRESHOLD) {
                documentId = prediction.invoiceNumber.value || '';
                console.log(`✅ Invoice - High confidence invoice number: ${documentId}`);
            }
            // Use document date as expiry date (for bill validity)
            if (prediction.date && prediction.date.confidence > CONFIDENCE_THRESHOLD) {
                expiryDate = prediction.date.value || '';
                console.log(`✅ Invoice - High confidence document date: ${expiryDate}`);
            }
            // Ensure we return empty strings instead of null/undefined to prevent frontend crashes
            const result = {
                fullName: fullName || '',
                documentId: documentId || '',
                expiryDate: expiryDate || '',
                birthDate: '',
                address: address || ''
            };
            // Log extracted data for debugging
            console.log('🏠 Address Proof OCR Results (InvoiceV4):', {
                fullName: result.fullName ? `✅ ${result.fullName}` : '❌ Empty',
                documentId: result.documentId ? `✅ ${result.documentId}` : '❌ Empty',
                address: result.address ? `✅ ${result.address}` : '❌ Empty',
                expiryDate: result.expiryDate ? `✅ ${result.expiryDate}` : '❌ Empty'
            });
            return result;
        }
        catch (error) {
            console.error('Error extracting address data:', error);
            // Return empty strings to prevent frontend crashes
            return {
                fullName: '',
                documentId: '',
                expiryDate: '',
                birthDate: '',
                address: ''
            };
        }
    }
    extractGenericData(document) {
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
        }
        catch (error) {
            console.error('Error extracting generic data:', error);
            return {};
        }
    }
    extractNameFromText(text) {
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
    extractDocumentIdFromText(text) {
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
    // Enhanced address extraction from receipt OCR
    extractAddressFromText(prediction) {
        // Look for addresses in various receipt fields
        const textFields = [
            prediction.supplier_address?.value,
            prediction.customer_address?.value,
            prediction.merchant_address?.value,
            prediction.supplier_name?.value, // Sometimes address is embedded in name field
            prediction.customer_name?.value
        ].filter(Boolean);
        // Also check line items for addresses
        if (prediction.line_items) {
            for (const item of prediction.line_items) {
                if (item.description?.value) {
                    textFields.push(item.description.value);
                }
            }
        }
        for (const text of textFields) {
            // Comprehensive address patterns
            const addressPatterns = [
                /(?:address|addr|location)[\s:]+([^\n\r]{10,100})/i, // "Address: 123 Main St, City, State"
                /(\d+\s+[A-Za-z0-9\s,.-]{15,100})(?:\n|$)/, // Street address pattern
                /([A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})/, // "City, State ZIP"
                /(\d+\s+[A-Za-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct))/i, // Full street address
            ];
            for (const pattern of addressPatterns) {
                const match = text.match(pattern);
                if (match && match[1] && match[1].trim().length > 10) {
                    // Clean up the address
                    const address = match[1].trim();
                    // Remove common non-address suffixes
                    const cleanAddress = address.replace(/\s+(?:total|amount|date|phone|email).*$/i, '');
                    if (cleanAddress.length > 10) {
                        return cleanAddress;
                    }
                }
            }
        }
        return undefined;
    }
}
// Export singleton instance
exports.ocrService = new OCRService();
//# sourceMappingURL=ocrService.js.map