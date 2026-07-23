import React, { useState } from 'react';
import { Modal, Button, Radio, InputNumber, Space, Typography, Divider, Row, Col } from 'antd';
import { PrinterOutlined, BarcodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { generateCode128Svg } from '../../utils/barcode';
import { Product } from '../../types/product.types';
import { useCurrency } from '../../contexts/CurrencyContext';

const { Title, Text } = Typography;

interface BarcodePrintModalProps {
    open: boolean;
    onCancel: () => void;
    product: Product | null;
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ open, onCancel, product }) => {
    const { formatAmount } = useCurrency();
    const [copies, setCopies] = useState<number>(12);
    const [printMode, setPrintMode] = useState<'THERMAL' | 'A4_SHEET'>('A4_SHEET');

    if (!product) return null;

    const barcodeSvg = generateCode128Svg(product.sku, 220, 50);

    const handlePrint = () => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const singleStickerHtml = `
            <div class="sticker-box">
                <div class="brand">POSBUZZ RETAIL</div>
                <div class="product-name">${product.name}</div>
                <div class="price">${formatAmount(Number(product.price))} <small>/ ${product.unit || 'Pcs'}</small></div>
                <div class="barcode-svg">${barcodeSvg}</div>
                <div class="sku-code">* ${product.sku} *</div>
            </div>
        `;

        let bodyContent = '';
        if (printMode === 'THERMAL') {
            bodyContent = Array(copies).fill(singleStickerHtml).map(html => `<div class="page-break">${html}</div>`).join('');
        } else {
            const gridStickers = Array(copies).fill(singleStickerHtml).join('');
            bodyContent = `<div class="a4-grid">${gridStickers}</div>`;
        }

        const styles = printMode === 'THERMAL' ? `
            @page { size: 50mm 30mm; margin: 0; }
            body { margin: 0; padding: 0; font-family: sans-serif; background: #fff; }
            .page-break { page-break-after: always; display: flex; justify-content: center; align-items: center; height: 30mm; width: 50mm; }
            .sticker-box { width: 48mm; height: 28mm; border: 1px solid #000; padding: 3px; box-sizing: border-box; text-align: center; border-radius: 4px; }
            .brand { font-size: 8px; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 0.5px; }
            .product-name { font-size: 10px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 1px 0; }
            .price { font-size: 13px; font-weight: 900; color: #000; margin-bottom: 2px; }
            .barcode-svg svg { width: 100%; height: 32px; display: block; }
            .sku-code { font-size: 8px; font-family: monospace; font-weight: 700; margin-top: 1px; }
        ` : `
            @page { size: A4; margin: 10mm; }
            body { margin: 0; padding: 0; font-family: sans-serif; background: #fff; }
            .a4-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8mm 6mm; }
            .sticker-box { border: 1px dashed #666; padding: 6px; text-align: center; border-radius: 6px; background: #fff; height: 32mm; box-sizing: border-box; }
            .brand { font-size: 9px; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 0.5px; }
            .product-name { font-size: 11px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 2px 0; }
            .price { font-size: 14px; font-weight: 900; color: #000; margin-bottom: 2px; }
            .barcode-svg svg { width: 90%; height: 36px; display: block; margin: 0 auto; }
            .sku-code { font-size: 9px; font-family: monospace; font-weight: 700; margin-top: 2px; }
        `;

        const fullDocument = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Barcode Label Sticker Print - ${product.name}</title>
                    <style>${styles}</style>
                </head>
                <body>
                    ${bodyContent}
                </body>
            </html>
        `;

        iframe.contentWindow?.document.open();
        iframe.contentWindow?.document.write(fullDocument);
        iframe.contentWindow?.document.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    };

    return (
        <Modal
            title={
                <Space align="center">
                    <BarcodeOutlined style={{ color: '#85861b', fontSize: 20 }} />
                    <span style={{ fontWeight: 800 }}>Barcode Label Sticker Printing</span>
                </Space>
            }
            open={open}
            onCancel={onCancel}
            width={620}
            footer={[
                <Button key="cancel" onClick={onCancel}>Cancel</Button>,
                <Button key="print" type="primary" className="btn-purple-primary" icon={<PrinterOutlined />} onClick={handlePrint}>
                    Print {copies} Barcode Sticker(s)
                </Button>
            ]}
        >
            <div style={{ padding: '10px 0' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Printer Paper Layout:</Text>
                        <Radio.Group
                            value={printMode}
                            onChange={e => setPrintMode(e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                            style={{ width: '100%' }}
                        >
                            <Radio.Button value="A4_SHEET" style={{ width: '50%', textAlign: 'center', fontWeight: 700 }}>A4 Sheet Grid</Radio.Button>
                            <Radio.Button value="THERMAL" style={{ width: '50%', textAlign: 'center', fontWeight: 700 }}>Thermal 50x30mm</Radio.Button>
                        </Radio.Group>
                    </Col>
                    <Col span={12}>
                        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Label Sticker Copies:</Text>
                        <InputNumber
                            min={1}
                            max={200}
                            value={copies}
                            onChange={val => setCopies(val || 1)}
                            style={{ width: '100%' }}
                            addonAfter="Stickers"
                        />
                    </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>Sticker Label Live High-Resolution Preview:</Text>
                
                {/* Live Preview Box */}
                <div style={{
                    background: '#ffffff',
                    border: '2px solid #85861b',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    maxWidth: 280,
                    margin: '0 auto 16px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                    color: '#09090b'
                }}>
                    <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b' }}>
                        POSBUZZ RETAIL
                    </div>
                    <Title level={5} style={{ margin: '4px 0 2px', fontWeight: 800, color: '#09090b' }}>
                        {product.name}
                    </Title>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#85861b', marginBottom: 6 }}>
                        {formatAmount(Number(product.price))} <span style={{ fontSize: 11, color: '#64748b' }}>/ {product.unit || 'Pcs'}</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: barcodeSvg }} />
                    <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>
                        * {product.sku} *
                    </div>
                </div>

                <div style={{ background: '#fafafa', padding: 12, borderRadius: 10, border: '1px solid #e4e4e7' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 6 }} /> CODE128 vector barcode lines render at high DPI for 100% hardware scanner compatibility.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};
