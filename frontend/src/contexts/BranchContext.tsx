import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';

export interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
    manager: string;
    isMain?: boolean;
}

const DEFAULT_BRANCHES: Branch[] = [
    { id: 'b1', name: 'Dhaka Main Store', address: 'Plot 12, Road 45, Gulshan-2, Dhaka', phone: '+880 1711 000111', manager: 'Tanvir Hossain', isMain: true },
    { id: 'b2', name: 'Chittagong Outlet', address: 'GEC Circle, CDA Avenue, Chittagong', phone: '+880 1819 222333', manager: 'Rafiqul Islam' },
    { id: 'b3', name: 'Online E-Commerce', address: 'Cloud Warehouse & Fulfillment Center', phone: '+880 1912 444555', manager: 'Nokib Ahmed' },
];

interface BranchContextType {
    branches: Branch[];
    activeBranch: Branch;
    setActiveBranchById: (id: string) => void;
    addBranch: (branch: Omit<Branch, 'id'>) => void;
    deleteBranch: (id: string) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [branches, setBranches] = useState<Branch[]>(() => {
        const saved = localStorage.getItem('posbuzz_branches');
        return saved ? JSON.parse(saved) : DEFAULT_BRANCHES;
    });

    const [activeBranchId, setActiveBranchId] = useState<string>(() => {
        return localStorage.getItem('posbuzz_active_branch_id') || 'b1';
    });

    useEffect(() => {
        localStorage.setItem('posbuzz_branches', JSON.stringify(branches));
    }, [branches]);

    useEffect(() => {
        localStorage.setItem('posbuzz_active_branch_id', activeBranchId);
    }, [activeBranchId]);

    const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

    const setActiveBranchById = (id: string) => {
        const target = branches.find(b => b.id === id);
        if (target) {
            setActiveBranchId(id);
            message.success(`Switched active store outlet to ${target.name}`);
        }
    };

    const addBranch = (newBranchDto: Omit<Branch, 'id'>) => {
        const newBranch: Branch = {
            ...newBranchDto,
            id: `branch-${Date.now()}`
        };
        setBranches([...branches, newBranch]);
        message.success(`New branch outlet "${newBranch.name}" created!`);
    };

    const deleteBranch = (id: string) => {
        if (branches.length <= 1) {
            message.warning('You must keep at least one active store outlet');
            return;
        }
        setBranches(branches.filter(b => b.id !== id));
        if (activeBranchId === id) {
            setActiveBranchId(branches.find(b => b.id !== id)?.id || 'b1');
        }
        message.success('Branch outlet removed');
    };

    return (
        <BranchContext.Provider value={{ branches, activeBranch, setActiveBranchById, addBranch, deleteBranch }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = (): BranchContextType => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};
