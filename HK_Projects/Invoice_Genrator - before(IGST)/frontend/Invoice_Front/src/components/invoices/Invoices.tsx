import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInvoiceById } from "../../API/InvoicesAPI";
import {
  PrinterOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  IdcardOutlined,
  CalendarOutlined,
  TagOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Divider,
  Spin,
  Statistic,
  Descriptions,
  Badge
} from "antd";

const { Title, Text } = Typography;

const colors = {
  primary: "#2C3E50",      
  secondary: "#4A5568",   
  accent: "#718096",      
  success: "#1A202C",      
  warning: "#A0AEC0",     
  danger: "#000000",     
  light: "#F7FAFC",     
  border: "#E2E8F0",      
  text: {
    primary: "#1A202C",    
    secondary: "#4A5568",  
    light: "#718096"       
  }
};

const MedicalInvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const invoiceData = await getInvoiceById(id as string);
      setInvoice(invoiceData);
    } catch (error: any) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: "expired", color: colors.danger };
    if (daysUntilExpiry < 30) return { status: "near_expiry", color: colors.warning };
    return { status: "good", color: colors.success };
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) => (
        <Text style={{ fontWeight: 500, color: colors.text.primary }}>
          {(index + 1).toString().padStart(2, '0')}
        </Text>
      ),
      width: 60,
      align: "center" as const,
    },
    {
      title: "Medicine Details",
      key: "medicine",
      width: 300,
      render: (record: any) => (
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Space align="center">
            <MedicineBoxOutlined style={{ color: colors.secondary, fontSize: 16 }} />
            <Text strong style={{ color: colors.text.primary, fontSize: 15 }}>
              {record.name}
            </Text>
          </Space>
          <Space size={12} style={{ marginLeft: 24 }}>
            <Tag icon={<ExperimentOutlined />} color={colors.accent} style={{ borderRadius: 12 }}>
              {record.category || "Medicine"}
            </Tag>
            <Text style={{ color: colors.text.light, fontSize: 12 }}>
              <IdcardOutlined /> Batch: {record.batchNo || "N/A"}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Expiry",
      key: "expiry",
      width: 100,
      align: "center" as const,
      render: (record: any) => {
        const expiryStatus = checkExpiry(record.expiry);
        return (
          <Tag 
            color={expiryStatus.color}
            style={{ 
              borderRadius: 20,
              padding: "4px 12px",
              border: "none",
              fontWeight: 500,
              color: expiryStatus.color === colors.danger ? "black" : 
                     expiryStatus.color === colors.success ? "black" : 
                     colors.text.primary
            }}
          >
            {record.expiry ? new Date(record.expiry).toLocaleDateString("en-GB", {
              month: 'short',
              year: 'numeric'
            }) : "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "MRP",
      dataIndex: "mrp",
      width: 90,
      align: "right" as const,
      render: (mrp: number) => (
        <Text style={{ color: colors.text.secondary }}>
          ₹{mrp?.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      width: 90,
      align: "right" as const,
      render: (rate: number) => (
        <Text strong style={{ color: colors.primary }}>
          ₹{rate?.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      width: 70,
      align: "center" as const,
      render: (qty: number) => (
        <Badge 
          count={qty} 
          style={{ 
            backgroundColor: colors.secondary,
            fontWeight: 600,
            boxShadow: "none",
            color: "white"
          }} 
        />
      ),
    },
    {
      title: "GST",
      dataIndex: "gstPercent",
      width: 70,
      align: "center" as const,
      render: (gst: number) => (
        <Tag style={{ background: colors.light, border: `1px solid ${colors.border}`, borderRadius: 12 }}>
          {gst}%
        </Tag>
      ),
    },
    {
      title: "Total",
      key: "total",
      width: 120,
      align: "right" as const,
      render: (record: any) => (
        <Text strong style={{ color: colors.success, fontSize: 16 }}>
          ₹{record.total?.toFixed(2)}
        </Text>
      ),
    },
  ];

  if (loading || !invoice) {
    return (
      <div style={{
        minHeight: "100vh",
        background: colors.light,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}>
        <Card style={{ 
          padding: 64, 
          borderRadius: 24, 
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          maxWidth: 480,
          border: "none",
        }}>
          <Spin size="large" style={{ marginBottom: 24 }} />
          <Title level={4} style={{ color: colors.primary }}>
            Loading Medical Invoice...
          </Title>
          <Text style={{ color: colors.text.secondary }}>
            Please wait while we fetch the details
          </Text>
        </Card>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
  
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
  
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const finalHeight = imgHeight > pdfHeight ? pdfHeight : imgHeight;
  
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, finalHeight);
    pdf.save(`Medical_Invoice_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div style={{
      padding: "30px",
      background: colors.light,
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ 
        textAlign: "center", 
        marginBottom: 24,
        position: "sticky",
        top: 20,
        zIndex: 100
      }}>
        <Button
          size="large"
          icon={<PrinterOutlined />}
          onClick={handleDownload}
          style={{
            borderRadius: 50,
            fontSize: 16,
            fontWeight: 600,
            padding: "12px 40px",
            background: colors.primary,
            border: "none",
            color: "#ffffff",
            boxShadow: `0 8px 20px ${colors.primary}40`,
            height: "auto",
          }}
        >
          Download Invoice as PDF
        </Button>
      </div>

      <div 
        ref={invoiceRef} 
        style={{ 
          maxWidth: 1200, 
          margin: "0 auto", 
          background: "#ffffff",
          borderRadius: 32,
          boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
          border: `1px solid ${colors.border}`
        }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          padding: "40px 40px 30px",
          color: "white",
        }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={16}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{
                  width: 100,
                  height: 100,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255,255,255,0.2)"
                }}>
                  <MedicineBoxOutlined style={{ fontSize: 48, color: "white" }} />
                </div>
                <div>
                  <Title level={1} style={{ 
                    margin: 0, 
                    color: "white", 
                    fontSize: 42, 
                    fontWeight: 700,
                    letterSpacing: "-0.5px"
                  }}>
                    {invoice.companyId?.name || "MEDICAL STORE"}
                  </Title>
                  <Space direction="vertical" size={4} style={{ marginTop: 12 }}>
                    <Space>
                      <EnvironmentOutlined style={{ opacity: 0.9 }} />
                      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 15 }}>
                        {invoice.companyId?.address || "123 Healthcare Avenue, Medical District"}
                      </Text>
                    </Space>
                    <Space>
                      <TagOutlined style={{ opacity: 0.9 }} />
                      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 15 }}>
                        GSTIN: {invoice.companyId?.gstNumber || "27ABCDE1234F1Z5"}
                      </Text>
                    </Space>
                  </Space>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8} style={{ textAlign: "right" }}>
              <div style={{
                background: "rgba(255,255,255,0.1)",
                padding: "24px 32px",
                borderRadius: 20,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)"
              }}>
                <Title level={2} style={{ 
                  margin: 0, 
                  color: "white", 
                  fontSize: 40, 
                  fontWeight: 800,
                  letterSpacing: "2px"
                }}>
                  TAX INVOICE
                </Title>
                <Divider style={{ borderColor: "rgba(255,255,255,0.2)", margin: "16px 0" }} />
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, display: "block" }}>
                  <strong>Invoice No:</strong> {invoice.invoiceNumber}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
                  <strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ padding: "40px 40px 20px" }}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card 
                style={{ 
                  borderRadius: 20,
                  border: `1px solid ${colors.border}`,
                  background: colors.light,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Space align="center" style={{ marginBottom: 20 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: colors.primary,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <UserOutlined style={{ color: "white", fontSize: 20 }} />
                  </div>
                  <Title level={4} style={{ margin: 0, color: colors.primary }}>
                    Patient Details
                  </Title>
                </Space>

                <Descriptions column={1} bordered={false} size="small">
                  <Descriptions.Item 
                    label={<Text strong style={{ color: colors.text.primary }}>Name</Text>}
                  >
                    <Text style={{ fontSize: 16, fontWeight: 600, color: colors.primary }}>
                      {invoice.customerName}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: colors.text.primary }}>Mobile</Text>}
                  >
                    <Space>
                      <PhoneOutlined style={{ color: colors.secondary }} />
                      <Text>{invoice.customerMobile || "+91 98765 43210"}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: colors.text.primary }}>Prescription</Text>}
                  >
                    <Tag color={colors.accent} style={{ borderRadius: 16 }}>RX-{invoice.invoiceNumber?.slice(-6)}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card 
                style={{ 
                  borderRadius: 20,
                  border: `1px solid ${colors.border}`,
                  background: colors.light,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Space align="center" style={{ marginBottom: 20 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: colors.secondary,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <ShopOutlined style={{ color: "white", fontSize: 20 }} />
                  </div>
                  <Title level={4} style={{ margin: 0, color: colors.secondary }}>
                    Dispensed By
                  </Title>
                </Space>

                <Descriptions column={1} bordered={false} size="small">
                  <Descriptions.Item 
                    label={<Text strong style={{ color: colors.text.primary }}>Pharmacist</Text>}
                  >
                    <Space>
                      <UserOutlined style={{ color: colors.accent }} />
                      <Text strong>{invoice.storeId?.ownerName || "Dr. Sarah Johnson"}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: colors.text.primary }}>License No</Text>}
                  >
                    <Tag color={colors.accent} style={{ borderRadius: 16 }}>DL-{Math.floor(Math.random() * 10000)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: colors.text.primary }}>Contact</Text>}
                  >
                    <Space>
                      <MailOutlined style={{ color: colors.secondary }} />
                      <Text>{invoice.storeId?.email || "pharmacy@medical.com"}</Text>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{ padding: "0 40px 30px" }}>
          <div style={{
            background: colors.primary,
            padding: "16px 24px",
            borderRadius: "16px 16px 0 0",
          }}>
            <Title level={4} style={{ margin: 0, color: "white" }}>
              <MedicineBoxOutlined style={{ marginRight: 12 }} />
              Prescribed Medicines
            </Title>
          </div>
          
          <Table
            columns={columns}
            dataSource={invoice.items}
            pagination={false}
            bordered={false}
            size="middle"
            style={{
              background: "white",
              borderRadius: "0 0 16px 16px",
              overflow: "hidden",
              border: `1px solid ${colors.border}`,
              borderTop: "none"
            }}
            rowClassName={() => "medical-table-row"}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} />
                  <Table.Summary.Cell index={5} colSpan={2}>
                    <div style={{ padding: "16px 24px", background: colors.light }}>
                      <Text strong style={{ fontSize: 16, color: colors.text.primary }}>
                        Sub Total:
                      </Text>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7}>
                    <div style={{ padding: "16px 24px", background: colors.light }}>
                      <Text strong style={{ fontSize: 18, color: colors.primary }}>
                        ₹{invoice.subTotal?.toFixed(2)}
                      </Text>
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} />
                  <Table.Summary.Cell index={5} colSpan={2}>
                    <div style={{ padding: "16px 24px", background: colors.light }}>
                      <Text strong style={{ fontSize: 16, color: colors.text.primary }}>
                        GST Total:
                      </Text>
                    </div>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7}>
                    <div style={{ padding: "16px 24px", background: colors.light }}>
                      <Text strong style={{ fontSize: 18, color: colors.secondary }}>
                        ₹{invoice.gstTotal?.toFixed(2)}
                      </Text>
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>

        <div style={{ padding: "0 40px 40px" }}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card style={{
                borderRadius: 20,
                border: `2px solid ${colors.primary}`,
                background: colors.light,
                height: "100%"
              }}>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <Space>
                    <CalendarOutlined style={{ color: colors.primary, fontSize: 18 }} />
                    <Text strong>Prescription Valid Until:</Text>
                    <Tag color={colors.success} style={{ borderRadius: 16, color: "black" }}>
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </Tag>
                  </Space>
                  
                  <Space>
                    <DollarOutlined style={{ color: colors.primary, fontSize: 18 }} />
                    <Text strong>Payment Method:</Text>
                    <Tag color={colors.accent} style={{ borderRadius: 16, fontWeight: 600 }}>
                      {invoice.paymentMethod || "CASH"}
                    </Tag>
                  </Space>

                  <Divider style={{ margin: "8px 0", borderColor: colors.border }} />

                  <Text type="secondary" style={{ fontSize: 13 }}>
                    * This is a computer generated invoice. Valid without signature.
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card style={{
                borderRadius: 20,
                border: `2px solid ${colors.success}`,
                background: `linear-gradient(135deg, ${colors.success}10, ${colors.success}20)`,
              }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Title level={3} style={{ margin: 0, color: colors.text.primary }}>
                      GRAND TOTAL
                    </Title>
                    <Text type="secondary">(Inclusive of all taxes)</Text>
                  </Col>
                  <Col>
                    <Statistic
                      value={invoice.grandTotal || 0}
                      precision={2}
                      prefix="₹"
                      valueStyle={{
                        color: colors.success,
                        fontSize: 42,
                        fontWeight: 800
                      }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{
          background: colors.light,
          padding: "30px 40px",
          borderTop: `2px solid ${colors.border}`,
        }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={16}>
              <Title level={5} style={{ color: colors.primary, marginBottom: 16 }}>
                Terms & Conditions
              </Title>
              <Space direction="vertical" size={8}>
                <Text style={{ color: colors.text.secondary }}>
                  • Medicines once sold cannot be taken back or exchanged.
                </Text>
                <Text style={{ color: colors.text.secondary }}>
                  • Please check expiry date and batch number before leaving the counter.
                </Text>
                <Text style={{ color: colors.text.secondary }}>
                  • Keep this invoice for any future reference or claims.
                </Text>
                <Text style={{ color: colors.text.secondary }}>
                  • For any queries, contact our pharmacist within 7 days.
                </Text>
              </Space>
            </Col>
            
            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <div style={{
                borderTop: `2px dashed ${colors.border}`,
                width: "80%",
                margin: "20px auto 0",
                paddingTop: 20
              }}>
                <Text strong style={{ color: colors.primary }}>Authorized Signatory</Text>
                <div style={{ marginTop: 40 }}>
                  <Text style={{ color: colors.text.light }}>For {invoice.companyId?.name || "Medical Store"}</Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider style={{ borderColor: colors.border, margin: "24px 0 0" }} />
          
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Text style={{ color: colors.text.light, fontSize: 12 }}>
              This is a system generated invoice • {new Date().toLocaleString()} • Invoice #{invoice.invoiceNumber}
            </Text>
          </div>
        </div>
      </div>

      <style>
        {`
          .medical-table-row:hover {
            background: ${colors.light} !important;
          }
          .ant-table-tbody > tr > td {
            padding: 16px 8px !important;
            border-bottom: 1px solid ${colors.border} !important;
          }
          .ant-table-thead > tr > th {
            background: ${colors.light} !important;
            color: ${colors.primary} !important;
            font-weight: 700 !important;
            padding: 16px 8px !important;
            border-bottom: 2px solid ${colors.primary} !important;
          }
        `}
      </style>
    </div>
  );
};

export default MedicalInvoiceView;