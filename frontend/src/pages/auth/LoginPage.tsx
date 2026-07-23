import React, { useState } from 'react';
import { Form, Input, Button, Typography, Checkbox, Alert, message, Select, Tag, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, EnvironmentOutlined, SafetyCertificateOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useBranch } from '../../contexts/BranchContext';
import { LoginDto } from '../../types/auth.types';

const { Title, Text } = Typography;
const { Option } = Select;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { branches, setActiveBranchById } = useBranch();
    const [form] = Form.useForm();
    const [loginBranchId, setLoginBranchId] = useState<string>('b1');

    const from = location.state?.from?.pathname || '/dashboard';

    const loginMutation = useMutation({
        mutationFn: async (values: LoginDto) => {
            await login(values);
        },
        onSuccess: () => {
            setActiveBranchById(loginBranchId);
            const branchObj = branches.find(b => b.id === loginBranchId);
            message.success(`Welcome to POSBuzz! Active Outlet: ${branchObj?.name || 'Dhaka Main Store'}`);
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

    const handleDemoLogin = (email: string, pass: string, targetBranchId: string) => {
        setLoginBranchId(targetBranchId);
        form.setFieldsValue({ email, password: pass });
        loginMutation.mutate({ email, password: pass });
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            position: 'fixed',
            inset: 0,
            background: '#09090b',
            backgroundImage: `linear-gradient(135deg, rgba(9, 9, 11, 0.78) 0%, rgba(18, 18, 24, 0.85) 100%), url('/login-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            zIndex: 9999,
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
            {/* Ambient Brand Glowing Mesh Orbs */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(214, 215, 80, 0.18) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(70px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '700px',
                height: '700px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(133, 134, 27, 0.22) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            {/* Dark Glassmorphic Centered Card (580px width) */}
            <div className="dark-login-card" style={{
                width: '100%',
                maxWidth: '580px',
                background: 'rgba(20, 20, 24, 0.88)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderRadius: '24px',
                border: '1px solid rgba(214, 215, 80, 0.3)',
                padding: '32px 36px',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(214, 215, 80, 0.12)',
                zIndex: 2,
                position: 'relative'
            }}>
                {/* Brand Header & Tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(63, 63, 70, 0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: '#d6d750',
                            color: '#09090b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            boxShadow: '0 4px 14px rgba(214, 215, 80, 0.45)'
                        }}>
                            <AppstoreOutlined />
                        </div>
                        <div>
                            <Title level={3} style={{ color: '#ffffff', margin: 0, fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>
                                POS<span style={{ color: '#d6d750' }}>Buzz</span>
                            </Title>
                            <Text style={{ color: '#a1a1aa', fontSize: '12px' }}>
                                Enterprise Multi-Store POS Terminal
                            </Text>
                        </div>
                    </div>

                    <Tag style={{
                        background: '#1f1f23',
                        color: '#d6d750',
                        border: '1px solid #e2e366',
                        borderRadius: 10,
                        padding: '4px 12px',
                        fontWeight: 800,
                        fontSize: '11px'
                    }}>
                        🇧🇩 BDT (Tk)
                    </Tag>
                </div>

                {loginMutation.isError && (
                    <Alert
                        message="Authentication Failed"
                        description={(loginMutation.error as any)?.response?.data?.message || 'Invalid credentials'}
                        type="error"
                        showIcon
                        style={{ marginBottom: 18, borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                    />
                )}

                <Form
                    form={form}
                    name="cyber_wave_login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    {/* Target Store Location Selector */}
                    <Form.Item label={<Text strong style={{ color: '#e4e4e7', fontSize: '12px', letterSpacing: '0.3px' }}>SELECT STORE OUTLET</Text>} style={{ marginBottom: 16 }}>
                        <Select
                            value={loginBranchId}
                            onChange={(val) => setLoginBranchId(val)}
                            suffixIcon={<EnvironmentOutlined style={{ color: '#d6d750' }} />}
                            style={{ width: '100%', height: 42 }}
                            classNames={{ popup: { root: 'dark-select-dropdown' } }}
                        >
                            {branches.map(b => (
                                <Option key={b.id} value={b.id}>
                                    📍 {b.name} ({b.address})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* 2-Column Email & Password Grid */}
                    <Row gutter={[14, 0]}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label={<Text strong style={{ color: '#e4e4e7', fontSize: '12px', letterSpacing: '0.3px' }}>USERNAME / EMAIL</Text>}
                                rules={[
                                    { required: true, message: 'Enter username or email' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#d6d750' }} />}
                                    placeholder="e.g. nokib_admin"
                                    style={{ height: 42 }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label={<Text strong style={{ color: '#e4e4e7', fontSize: '12px', letterSpacing: '0.3px' }}>PASSWORD</Text>}
                                rules={[{ required: true, message: 'Enter password' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#d6d750' }} />}
                                    placeholder="••••••••"
                                    style={{ height: 42 }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Remember & Sign In Action Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, marginTop: 4 }}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox style={{ color: '#a1a1aa', fontSize: '13px' }}>Remember me</Checkbox>
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loginMutation.isPending}
                            style={{
                                height: 44,
                                padding: '0 28px',
                                background: '#d6d750',
                                color: '#09090b',
                                fontWeight: 800,
                                fontSize: '14px',
                                borderRadius: 10,
                                border: 'none',
                                boxShadow: '0 4px 14px rgba(214, 215, 80, 0.45)'
                            }}
                        >
                            Sign In to Terminal
                        </Button>
                    </div>

                    {/* Horizontal 3-Column Demo Login Grid */}
                    <div style={{ paddingTop: 16, borderTop: '1px solid rgba(63, 63, 70, 0.6)' }}>
                        <Text strong style={{ display: 'block', fontSize: '11px', color: '#d6d750', marginBottom: 10, textAlign: 'center', letterSpacing: '0.5px' }}>
                            ⚡ 1-CLICK DEMO LOGIN ROLES
                        </Text>
                        <Row gutter={[10, 10]}>
                            <Col span={8}>
                                <Button
                                    block
                                    onClick={() => handleDemoLogin('admin@gmail.com', '!QAZ1qaz', 'b1')}
                                    style={{
                                        height: 40,
                                        borderRadius: 10,
                                        background: '#fefec8',
                                        border: '1px solid #e2e366',
                                        color: '#09090b',
                                        fontWeight: 800,
                                        fontSize: '11px'
                                    }}
                                >
                                    👑 Admin Demo
                                </Button>
                            </Col>
                            <Col span={8}>
                                <Button
                                    block
                                    onClick={() => handleDemoLogin('manager@posbuzz.com', '!QAZ1qaz', 'b2')}
                                    style={{
                                        height: 40,
                                        borderRadius: 10,
                                        background: '#1f1f23',
                                        border: '1px solid #3f3f46',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        fontSize: '11px'
                                    }}
                                >
                                    🏢 Manager Demo
                                </Button>
                            </Col>
                            <Col span={8}>
                                <Button
                                    block
                                    onClick={() => handleDemoLogin('employee@gmail.com', '!QAZ1qaz', 'b1')}
                                    style={{
                                        height: 40,
                                        borderRadius: 10,
                                        background: '#1f1f23',
                                        border: '1px solid #3f3f46',
                                        color: '#ffffff',
                                        fontWeight: 700,
                                        fontSize: '11px'
                                    }}
                                >
                                    🛒 Cashier Demo
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    <div style={{ marginTop: 16, textAlign: 'center', color: '#71717a', fontSize: '11px' }}>
                        <SafetyCertificateOutlined style={{ color: '#d6d750', marginRight: 4 }} />
                        Encrypted SSL 256-Bit Terminal Auth
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;
