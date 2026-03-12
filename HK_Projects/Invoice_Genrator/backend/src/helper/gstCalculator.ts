export const calculateGST = (
    base: number,
    gstType: "IGST" | "CGST_SGST",
    gstPercent: number
  ) => {
    let gst = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
  
    if (gstType === "IGST") {
      igst = (base * gstPercent) / 100;
      gst = igst;
    } else {
      const halfRate = gstPercent / 2;
      cgst = (base * halfRate) / 100;
      sgst = (base * halfRate) / 100;
      gst = cgst + sgst;
    }
  
    return { gst, cgst, sgst, igst };
  };