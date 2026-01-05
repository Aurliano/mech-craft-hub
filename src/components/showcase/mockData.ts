import { Project } from './types';

export const mockProjects: Project[] = [
    {
        id: 'kanoair-001',
        title: 'طراحی و نقشه کشی کانوایر',
        status: 'completed',
        client: {
            id: 'luna-biscuit',
            name: 'کارخانه بیسکوییت لونا',
            avatar: 'https://i.pravatar.cc/150?u=luna-biscuit',
            role: 'client',
        },
        contractor: {
            id: 'sayda-engineering',
            name: 'گروه مهندسی سایدا',
            avatar: 'https://i.pravatar.cc/150?u=sayda-engineering',
            role: 'contractor',
            badge: 'A',
        },
        description: 'نیاز به طراحی و مدل‌سازی یک نوار نقاله جهت استفاده در خط تولید کارخانه داریم. نقشه ها و مستندات پروژه هم مورد نیاز است.',
        phases: [
            { id: 'p1', name: 'فاز اول: آماده سازی طرح اولیه و بررسی بازخورد کارفرما', completed: true },
            { id: 'p2', name: 'فاز دوم: تحلیل و شبیه سازی طرح سه بعدی در نرم افزار', completed: true },
            { id: 'p3', name: 'فاز سوم: تهیه و نهایی سازی مستندات پروژه (نقشه ها، سند کنترل کیفی و ...)', completed: true },
        ],
        contractorProposal: 'سلام و احترام\nما با دارا بودن مهندسین خبره و باتجربه، در کمترین زمان ممکن، پروژه شما را همراه با مستندات خواسته شده، با قابلیت بازاستفاده، به شما تحویل میدهیم.',
        clientReview: {
            userId: 'luna-biscuit',
            text: 'ایده ها و بازخورد های ما در این پروژه به خوبی مدنظر قرار داده شد. مستندات فنی جامع و دقیقی را برای ساخت ارائه دادند.',
            rating: 5,
            date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 hours ago
        },
        contractorReview: {
            userId: 'sayda-engineering',
            text: 'کارفرما بسیار حرفه ای و قابل اعتماد بودند.',
            rating: 4,
            date: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 hours ago
        },
        media: [
            { id: 'kanoair-1', type: 'image', url: '/images/kanoair/conveyor-1.jpg', thumbnail: '/images/kanoair/conveyor-1-thumb.jpg' },
            { id: 'kanoair-2', type: 'image', url: '/images/kanoair/conveyor-2.jpg', thumbnail: '/images/kanoair/conveyor-2-thumb.jpg' },
            { id: 'kanoair-3', type: 'image', url: '/images/kanoair/conveyor-3.jpg', thumbnail: '/images/kanoair/conveyor-3-thumb.jpg' },
            { id: 'kanoair-4', type: 'image', url: '/images/kanoair/conveyor-4.jpg', thumbnail: '/images/kanoair/conveyor-4-thumb.jpg' },
            { id: 'kanoair-5', type: 'image', url: '/images/kanoair/conveyor-5.jpg', thumbnail: '/images/kanoair/conveyor-5-thumb.jpg' },
            { id: 'kanoair-6', type: 'image', url: '/images/kanoair/conveyor-6.jpg', thumbnail: '/images/kanoair/conveyor-6-thumb.jpg' },
        ],
    },
];
