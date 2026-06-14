export interface Subject {
    id: string;
    title: string;
    createdBy: string;
    updatedAt: number;
    isSynced: boolean;
    isDeleted: boolean;
}

// 7. The Grade Levels Registry (NEW)
export interface GradeLevel {
    id: string;
    title: string;
    createdBy: string;
    updatedAt: number;
    isSynced: boolean;
    isDeleted: boolean;
}
