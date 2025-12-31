import React, { useState } from 'react';
import { Project } from './types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Star, CheckCircle2, MessageCircle, FileText, Image as ImageIcon, Play, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="w-full max-w-2xl mx-auto overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300 bg-white rounded-3xl" dir="rtl">
            {/* Header - Gradient */}
            <div className={`h-24 relative overflow-hidden bg-gradient-to-l from-blue-700 to-blue-500`}>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                <div className="relative z-10 p-6 flex justify-between items-start text-white">
                    <div>
                        <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                        <div className="flex items-center gap-2 text-blue-100 text-xs">
                            <span>پروژه #{project.id}</span>
                            <span>•</span>
                            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] px-2 h-5">
                                {project.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                            </Badge>
                        </div>
                    </div>
                    <Avatar className="w-16 h-16 border-4 border-white/20 shadow-xl">
                        <AvatarImage src={project.client.avatar} alt={project.client.name} className="object-cover" />
                        <AvatarFallback>{project.client.name[0]}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <CardContent className="p-0">
                {/* Users Section */}
                <div className="grid grid-cols-2 divide-x divide-x-reverse border-b">
                    {/* Client (Left in RTL, but flex-row means right in visual if dir=rtl) - actually lets stick to grid */}
                    <div className="p-4 flex flex-col items-center text-center space-y-2">
                        <span className="text-xs text-muted-foreground font-medium">کارفرما</span>
                        <div className="flex flex-col items-center">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{project.client.name}</h4>
                            <Badge variant="outline" className="mt-1 text-[10px] text-slate-500 bg-slate-50 border-slate-200">
                                سفارش‌دهنده
                            </Badge>
                        </div>
                    </div>

                    {/* Contractor */}
                    <div className="p-4 flex flex-col items-center text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/20">
                        <span className="text-xs text-muted-foreground font-medium">پیمانکار</span>
                        <div className="flex flex-col items-center w-full">
                            <div className="flex items-center gap-3 w-full justify-center">
                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={project.contractor.avatar} />
                                    <AvatarFallback>{project.contractor.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-right">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{project.contractor.name}</h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        {project.contractor.badge && (
                                            <Badge
                                                className={cn(
                                                    "text-[10px] px-1.5 h-4 border-0",
                                                    project.contractor.badge === 'A' ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                                                        project.contractor.badge === 'B' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                                                            "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                )}
                                            >
                                                سطح {project.contractor.badge}
                                            </Badge>
                                        )}
                                        <div className="flex items-center text-[10px] text-amber-500">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="mr-0.5 pt-0.5">4.8</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Details */}
                <div className="p-6 pb-4">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 mb-6 bg-slate-100/80 p-1">
                            <TabsTrigger value="description" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">توضیحات پروژه</TabsTrigger>
                            <TabsTrigger value="phases" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">مراحل انجام</TabsTrigger>
                            <TabsTrigger value="proposal" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">پیشنهاد پیمانکار</TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="mt-0 min-h-[100px]">
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 text-justify">
                                {project.description}
                            </p>
                        </TabsContent>

                        <TabsContent value="phases" className="mt-0 min-h-[100px]">
                            <div className="space-y-3">
                                {project.phases.map((phase) => (
                                    <div key={phase.id} className="flex items-center gap-3 text-sm">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                            phase.completed ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                        )}>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={cn(
                                            phase.completed ? "text-slate-700 font-medium" : "text-slate-500"
                                        )}>{phase.name}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="proposal" className="mt-0 min-h-[100px]">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed">
                                {project.contractorProposal}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Reviews Section */}
                <div className="px-6 pb-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <h4 className="text-sm font-bold text-slate-900">نظرات و بازخورد</h4>
                    </div>

                    {/* Client Review */}
                    {project.clientReview && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/20 relative">
                            <div className="absolute -right-2 top-4 w-4 h-4 bg-blue-50 rotate-45 border-l border-b border-blue-100 hidden" /> {/* Little arrow logic if needed */}

                            <div className="flex gap-3">
                                <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarImage src={project.client.avatar} />
                                    <AvatarFallback>{project.client.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 w-full">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-blue-900">{project.client.name}</span>
                                        <div className="flex text-amber-400 text-[10px]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("w-2.5 h-2.5", i < project.clientReview!.rating ? "fill-current" : "text-slate-300")} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        "{project.clientReview.text}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contractor Output Header */}
                    <div className="mt-6 pt-6 border-t flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span>مستندات و خروجی‌ها</span>
                            </div>
                            <p className="text-[11px] text-slate-500">تصاویر و ویدئوهای نهایی پروژه</p>
                        </div>
                    </div>

                    {/* Media Gallery Grid */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                        {project.media.slice(0, 4).map((item, idx) => (
                            <Dialog key={item.id}>
                                <DialogTrigger asChild>
                                    <div className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-slate-100 ring-2 ring-transparent hover:ring-blue-500 transition-all">
                                        <img src={item.thumbnail} alt="project media" className="w-full h-full object-cover transition-transform group-hover:scale-110" />

                                        {/* Overlay for Video */}
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Count Overlay on last item if more exist */}
                                        {idx === 3 && project.media.length > 4 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-[2px]">
                                                +{project.media.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
                                    <div className="flex items-center justify-center">
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt="Full view" className="max-h-[80vh] rounded-lg shadow-2xl" />
                                        ) : (
                                            <video src={item.url} controls className="max-h-[80vh] rounded-lg shadow-2xl" />
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProjectCard;
