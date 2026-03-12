import { InvoiceModel } from "../database/models/invoice";

export const generateStoreInvoiceNumber = async (storeId: string) => {
    try {
     
        const highestEverUsed = await InvoiceModel.findOne({ 
            storeId 
        }).sort({ storeInvoiceNumber: -1 });
        
        let nextNumber: number;
        
        if (!highestEverUsed) {
            nextNumber = 1;
        } else {
            nextNumber = highestEverUsed.storeInvoiceNumber + 1;
        }
        
        if (isNaN(nextNumber) || nextNumber < 1) {
            throw new Error("Invalid store invoice number generated");
        }
        const displayNumber = nextNumber.toString().padStart(2, '0');
        console.log(`Store ${storeId} - Generated: ${displayNumber} (${nextNumber})`);
        console.log(`Previous highest for this store: ${highestEverUsed?.storeInvoiceNumber || 0}`);
        
        return {
            storeInvoiceNumber: nextNumber, 
            displayNumber: displayNumber  
        };
    } catch (error) {
        console.error("Error generating store invoice number:", error);
        throw new Error("Failed to generate store invoice number");
    }
};