import React from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { RegisterDto } from '../../types/auth.types';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form] = Form.useForm();

    const registerMutation = useMutation({
        mutationFn: async (values: RegisterDto) => {
            await register(values);
        },
        onSuccess: () => {
            message.success('Registration successful! Welcome to POSBuzz.');
            navigate('/');
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || 'Registration failed';
            message.error(errorMsg);
        },
    });

    const onFinish = (values: any) => {
        const { email, password } = values;
        registerMutation.mutate({ email, password });
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            <Card style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>Create Account</Title>
                    <Text type="secondary">Join POSBuzz for smart inventory management</Text>
                </div>

                {registerMutation.isError && (
                    <Alert
                        message="Registration Failed"
                        description={(registerMutation.error as any)?.response?.data?.message || 'Try again with a different email'}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    form={form}
                    name="register_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        label="Confirm Password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ width: '100%' }}
                            loading={registerMutation.isPending}
                        >
                            Register
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">Already have an account? </Text>
                        <Link to="/login" style={{ color: '#1677ff' }}>Sign in</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;
