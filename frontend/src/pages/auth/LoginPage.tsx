import React from 'react';
import { Form, Input, Button, Card, Typography, Checkbox, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { LoginDto } from '../../types/auth.types';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [form] = Form.useForm();

    const from = location.state?.from?.pathname || '/';

    const loginMutation = useMutation({
        mutationFn: async (values: LoginDto) => {
            await login(values);
        },
        onSuccess: () => {
            message.success('Login successful!');
            navigate(from, { replace: true });
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.message || 'Invalid email or password';
            message.error(errorMsg);
        },
    });

    const onFinish = (values: LoginDto) => {
        loginMutation.mutate(values);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>POSBuzz</Title>
                    <Text type="secondary">Sign in to your account</Text>
                </div>

                {loginMutation.isError && (
                    <Alert
                        message="Login Failed"
                        description={(loginMutation.error as any)?.response?.data?.message || 'Internal server error'}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    form={form}
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password" style={{ color: '#1677ff' }}>Forgot password?</Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ width: '100%' }}
                            loading={loginMutation.isPending}
                        >
                            Log in
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">Don't have an account? </Text>
                        <Link to="/register" style={{ color: '#1677ff' }}>Register now</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
