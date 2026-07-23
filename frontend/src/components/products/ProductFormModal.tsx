import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message, Select, Row, Col } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { supplierService } from '../../services/supplier.service';
import { useQuery } from '@tanstack/react-query';
import { Product, CreateProductDto } from '../../types/product.types';

const { Option } = Select;

interface ProductFormModalProps {
    open: boolean;
    onCancel: () => void;
    product?: Product | null;
}

export const MEASUREMENT_UNITS = [
    { value: 'Pcs', label: 'Pcs (Pieces)' },
    { value: 'Kg', label: 'Kg (Kilograms)' },
    { value: 'Gm', label: 'Gm (Grams)' },
    { value: 'Litre', label: 'Litre (Litres)' },
    { value: 'Ml', label: 'Ml (Millilitres)' },
    { value: 'Box', label: 'Box (Boxes)' },
    { value: 'Dozen', label: 'Dozen (Dozens)' },
    { value: 'Pack', label: 'Pack (Packs)' },
    { value: 'Meter', label: 'Meter (Meters)' },
];

const ProductFormModal: React.FC<ProductFormModalProps> = ({ open, onCancel, product }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEditing = !!product;

    const { data: suppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getAll
    });

    useEffect(() => {
        if (open && product) {
            form.setFieldsValue({
                ...product,
                unit: product.unit || 'Pcs',
                category: product.category || 'General'
            });
        } else if (open) {
            form.resetFields();
            form.setFieldsValue({ unit: 'Pcs', category: 'General', stock_quantity: 0, lowStockThreshold: 5 });
        }
    }, [open, product, form]);

    const mutation = useMutation({
        mutationFn: (values: CreateProductDto) => {
            if (isEditing && product) {
                return productService.updateProduct(product.id, values);
            }
            return productService.createProduct(values);
        },
        onSuccess: () => {
            message.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onCancel();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Something went wrong');
        },
    });

    const handleOk = () => {
        form.validateFields().then((values) => {
            const payload: any = {
                name: String(values.name || '').trim(),
                sku: String(values.sku || '').trim(),
                price: Number(values.price) || 0,
                costPrice: Number(values.costPrice) || 0,
                stock_quantity: Math.round(Number(values.stock_quantity) || 0),
                lowStockThreshold: Math.round(Number(values.lowStockThreshold) || 5),
            };
            if (values.supplierId) {
                payload.supplierId = values.supplierId;
            }
            mutation.mutate(payload);
        });
    };

    return (
        <Modal
            title={isEditing ? 'Edit Inventory Product' : 'Add New Product'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={mutation.isPending}
            destroyOnClose
            width={580}
        >
            <Form
                form={form}
                layout="vertical"
                name="product_form"
                initialValues={{ unit: 'Pcs', category: 'General', stock_quantity: 0, lowStockThreshold: 5 }}
            >
                <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please enter product name' }]}
                >
                    <Input placeholder="e.g. Miniket Rice / Sony Headphones / Fresh Milk" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="sku"
                            label="SKU / Barcode Code"
                            rules={[{ required: true, message: 'Please enter SKU' }]}
                        >
                            <Input placeholder="Enter unique SKU code" disabled={isEditing} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="category"
                            label="Category"
                        >
                            <Input placeholder="e.g. Groceries, Electronics, Apparel" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="unit"
                            label="Measurement Unit"
                            rules={[{ required: true, message: 'Select unit' }]}
                        >
                            <Select placeholder="Select Unit">
                                {MEASUREMENT_UNITS.map(u => (
                                    <Option key={u.value} value={u.value}>{u.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="price"
                            label="Selling Price (Tk)"
                            rules={[{ required: true, message: 'Please enter selling price' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0.01}
                                precision={2}
                                prefix="Tk "
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="costPrice"
                            label="Cost Price (Tk)"
                            rules={[{ required: true, message: 'Please enter cost price' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                prefix="Tk "
                                placeholder="Buying price"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="stock_quantity"
                            label="Stock Quantity"
                            rules={[{ required: true, message: 'Please enter stock quantity' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="lowStockThreshold"
                            label="Low Stock Alert Level"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="supplierId"
                            label="Supplier / Vendor"
                        >
                            <Select
                                placeholder="Select supplier"
                                allowClear
                                options={suppliers?.map((s: any) => ({ value: s.id, label: s.name }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
