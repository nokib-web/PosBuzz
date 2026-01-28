import React from 'react';
import { Form, Input, Button, Typography, Checkbox, Alert, message, Row, Col, theme } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { LoginDto } from '../../types/auth.types';

const { Title, Text, Paragraph } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [form] = Form.useForm();
    const { token } = theme.useToken();

    const from = location.state?.from?.pathname || '/';

    const loginMutation = useMutation({
        mutationFn: async (values: LoginDto) => {
            await login(values);
        },
        onSuccess: () => {
            message.success('Welcome back!');
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
        <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
            <Row style={{ minHeight: '100vh' }}>
                {/* Left Side - Hero Section */}
                <Col
                    xs={0}
                    md={12}
                    lg={14}
                    style={{
                        backgroundImage: 'url("/login-bg.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 21, 41, 0.7)', // Deep blue overlay matching branding
                        backdropFilter: 'blur(4px)',
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', textAlign: 'center' }}>
                        <div style={{
                            marginBottom: '24px',
                            display: 'inline-flex',
                            padding: '20px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <ThunderboltFilled style={{ fontSize: '64px', color: '#fff' }} />
                        </div>
                        <Title level={1} style={{ color: '#fff', fontSize: '48px', marginBottom: '16px', fontWeight: 700 }}>
                            POSBuzz
                        </Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', lineHeight: '1.6' }}>
                            The next-generation Point of Sale system designed to streamline your business operations and boost productivity.
                        </Paragraph>
                    </div>
                </Col>

                {/* Right Side - Login Form */}
                <Col
                    xs={24}
                    md={12}
                    lg={10}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        padding: '40px',
                    }}
                >
                    <div style={{ width: '100%', maxWidth: '420px' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <Title level={2} style={{ marginBottom: '8px' }}>Welcome Back</Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>Please enter your details to sign in.</Text>
                        </div>

                        {loginMutation.isError && (
                            <Alert
                                message="Authentication Failed"
                                description={(loginMutation.error as any)?.response?.data?.message || 'Internal server error'}
                                type="error"
                                showIcon
                                style={{ marginBottom: 24, borderRadius: '8px' }}
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
                                    { type: 'email', message: 'Invalid email format' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />}
                                    placeholder="Email Address"
                                    style={{ borderRadius: '8px', padding: '10px 14px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
                                    placeholder="Password"
                                    style={{ borderRadius: '8px', padding: '10px 14px' }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox>Remember me</Checkbox>
                                    </Form.Item>
                                    <Link to="/forgot-password" style={{ color: token.colorPrimary, fontWeight: 500 }}>
                                        Forgot password?
                                    </Link>
                                </div>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loginMutation.isPending}
                                    style={{
                                        height: '48px',
                                        fontSize: '16px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 14px 0 rgba(22, 119, 255, 0.3)'
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Form.Item>

                            <div style={{ marginTop: '32px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '24px',
                                    color: token.colorTextQuaternary
                                }}>
                                    <span style={{ borderBottom: '1px solid #f0f0f0', flex: 1, marginRight: '12px' }}></span>
                                    TEST ACCOUNTS
                                    <span style={{ borderBottom: '1px solid #f0f0f0', flex: 1, marginLeft: '12px' }}></span>
                                </div>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Button
                                            block
                                            onClick={() => form.setFieldsValue({
                                                email: 'admin@gmail.com',
                                                password: '!QAZ1qaz'
                                            })}
                                            style={{ height: '40px', borderRadius: '8px' }}
                                        >
                                            Demo Admin
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            block
                                            onClick={() => form.setFieldsValue({
                                                email: 'employee@gmail.com', // Updated per user request/code view
                                                password: '!QAZ1qaz'
                                            })}
                                            style={{ height: '40px', borderRadius: '8px' }}
                                        >
                                            Demo Employee
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                                <Text type="secondary">Don't have an account? </Text>
                                <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LoginPage;
