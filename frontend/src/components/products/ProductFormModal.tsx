import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message, Select, Row, Col } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { supplierService } from '../../services/supplier.service';
import { useQuery } from '@tanstack/react-query';
import { Product, CreateProductDto } from '../../types/product.types';

interface ProductFormModalProps {
    open: boolean;
    onCancel: () => void;
    product?: Product | null;
}

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
            form.setFieldsValue(product);
        } else if (open) {
            form.resetFields();
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
            mutation.mutate(values);
        });
    };

    return (
        <Modal
            title={isEditing ? 'Edit Product' : 'Add New Product'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={mutation.isPending}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                name="product_form"
                initialValues={{ stock_quantity: 0 }}
            >
                <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please enter product name' }]}
                >
                    <Input placeholder="Enter product name" />
                </Form.Item>

                <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true, message: 'Please enter SKU' }]}
                >
                    <Input placeholder="Enter unique SKU" disabled={isEditing} />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="price"
                            label="Selling Price"
                            rules={[{ required: true, message: 'Please enter price' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0.01}
                                precision={2}
                                prefix="$"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="costPrice"
                            label="Cost Price"
                            rules={[{ required: true, message: 'Please enter cost price' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                prefix="$"
                                placeholder="Buying price"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="supplierId"
                    label="Supplier / Vendor"
                >
                    <Select
                        placeholder="Select a supplier (Optional)"
                        allowClear
                        options={suppliers?.map((s: any) => ({ value: s.id, label: s.name }))}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="stock_quantity"
                            label="Stock Quantity"
                            rules={[{ required: true, message: 'Please enter stock quantity' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="lowStockThreshold"
                            label="Low Stock Alert Level"
                            rules={[{ required: true }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
