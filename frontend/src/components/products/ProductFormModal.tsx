import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
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

                <Form.Item
                    name="price"
                    label="Price"
                    rules={[{ required: true, message: 'Please enter price' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0.01}
                        precision={2}
                        prefix="$"
                    />
                </Form.Item>

                <Form.Item
                    name="stock_quantity"
                    label="Stock Quantity"
                    rules={[{ required: true, message: 'Please enter stock quantity' }]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;
