export interface User {
    id: string;
    name: string;
    avatar: string;
    role: 'client' | 'contractor';
    badge?: 'A' | 'B' | 'C'; // For contractors class
}

export interface Review {
    userId: string;
    rating: number; // 1-5
    text: string;
    date: string;
}

export interface Phase {
    id: string;
    name: string;
    completed: boolean;
}

export interface Media {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail: string;
}

export interface Project {
    id: string;
    title: string;
    status: 'completed' | 'in_progress';
    client: User;
    contractor: User;

    // Tab content
    description: string;
    contractorProposal: string;
    phases: Phase[];

    // Reviews
    clientReview?: Review;
    contractorReview?: Review;

    // Media
    media: Media[];
}
