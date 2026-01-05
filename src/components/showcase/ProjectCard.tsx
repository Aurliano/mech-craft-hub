import React, { useState } from 'react';
import { Project } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import { Star, CheckCircle2, MessageCircle, Play } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <Card className="w-full max-w-xl mx-auto overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300 bg-white rounded-2xl h-full flex flex-col" dir="rtl">
            {/* Header - Compact */}
            <div className={`h-16 relative overflow-hidden bg-gradient-to-l from-blue-700 to-blue-500 shrink-0`}>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                <div className="relative z-10 px-4 h-full flex items-center justify-between text-white">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold truncate">{project.title}</h3>
                            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] px-1.5 h-4 shrink-0">
                                {project.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-blue-100 text-[10px]">
                            <span>پروژه #{project.id}</span>
                        </div>
                    </div>
                    <Avatar className="w-12 h-12 border-2 border-white/20 shadow-lg shrink-0 mr-3">
                        <AvatarImage src={project.client.avatar} alt={project.client.name} className="object-cover" />
                        <AvatarFallback>{project.client.name[0]}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <CardContent className="p-0 flex flex-col flex-1">
                {/* Users Section - Compact Grid */}
                <div className="grid grid-cols-2 divide-x divide-x-reverse border-b shrink-0">
                    {/* Client */}
                    <div className="p-2 flex items-center gap-2 justify-center bg-slate-50/30">
                        <div className="text-right">
                            <div className="text-[10px] text-muted-foreground">کارفرما</div>
                            <div className="font-bold text-xs text-slate-800">{project.client.name}</div>
                        </div>
                    </div>

                    {/* Contractor */}
                    <div className="p-2 flex items-center gap-2 justify-center bg-slate-50/80">
                        <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border border-white shadow-sm">
                                <AvatarImage src={project.contractor.avatar} />
                                <AvatarFallback>{project.contractor.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-right">
                                <div className="font-bold text-xs text-slate-800">{project.contractor.name}</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {project.contractor.badge && (
                                        <Badge
                                            className={cn(
                                                "text-[9px] px-1 h-3.5 border-0 font-normal",
                                                project.contractor.badge === 'A' ? "bg-amber-100 text-amber-700" :
                                                    project.contractor.badge === 'B' ? "bg-emerald-100 text-emerald-700" :
                                                        "bg-blue-100 text-blue-700"
                                            )}
                                        >
                                            کلاس {project.contractor.badge}
                                        </Badge>
                                    )}
                                    <div className="flex items-center text-[9px] text-amber-500 font-bold">
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                        <span className="mr-0.5 pt-0.5">4.8</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Details - Flex container to fill space but keep it compact */}
                <div className="p-3 min-h-0 flex-1 flex flex-col">
                    <Tabs defaultValue="description" className="w-full flex flex-col h-full" dir="rtl">
                        <TabsList className="w-full grid grid-cols-3 mb-2 bg-slate-100/80 p-0.5 h-8 shrink-0">
                            <TabsTrigger value="description" className="text-[11px] h-7 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">توضیحات</TabsTrigger>
                            <TabsTrigger value="phases" className="text-[11px] h-7 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">مراحل</TabsTrigger>
                            <TabsTrigger value="proposal" className="text-[11px] h-7 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">پیشنهاد</TabsTrigger>
                        </TabsList>

                        {/* Scrollable Content Area with max height */}
                        <div className="flex-1 relative min-h-[85px] overflow-y-auto pr-1 pl-1 scrollbar-thin scrollbar-thumb-slate-200">
                            <TabsContent value="description" className="mt-0 absolute inset-0 text-right">
                                <p className="text-xs leading-5 text-slate-600 text-right" dir="rtl">
                                    {project.description}
                                </p>
                            </TabsContent>

                            <TabsContent value="phases" className="mt-0 absolute inset-0 text-right">
                                <div className="space-y-2 text-right" dir="rtl">
                                    {project.phases.map((phase) => (
                                        <div key={phase.id} className="flex items-center gap-2 text-xs">
                                            <div className={cn(
                                                "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                                                phase.completed ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <CheckCircle2 className="w-3 h-3" />
                                            </div>
                                            <span className={cn(
                                                phase.completed ? "text-slate-700 font-medium" : "text-slate-500"
                                            )}>{phase.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="proposal" className="mt-0 absolute inset-0 text-right">
                                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed text-right" dir="rtl">
                                    {project.contractorProposal}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Reviews & Media Section - Compact */}
                <div className="px-3 pb-3 shrink-0 space-y-2.5 bg-white">
                    <div className="border-t pt-2.5 space-y-2">
                        {/* Client Review */}
                        {project.clientReview && (
                            <div className="bg-blue-50/50 rounded-lg p-2 border border-blue-100 flex gap-2 items-start" dir="rtl">
                                <div className="space-y-0.5 w-full text-right">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <MessageCircle className="w-3 h-3 text-blue-500" />
                                            <span className="text-[11px] font-bold text-blue-900">نظر کارفرما</span>
                                        </div>
                                        <div className="flex text-amber-400 text-[9px] gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("w-2 h-2", i < project.clientReview!.rating ? "fill-current" : "text-slate-300")} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 text-right" dir="rtl">
                                        "{project.clientReview.text}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Contractor Review */}
                        {project.contractorReview && (
                            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex gap-2 items-start" dir="rtl">
                                <div className="space-y-0.5 w-full text-right">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <MessageCircle className="w-3 h-3 text-slate-500" />
                                            <span className="text-[11px] font-bold text-slate-700">نظر پیمانکار</span>
                                        </div>
                                        <div className="flex text-amber-400 text-[9px] gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("w-2 h-2", i < project.contractorReview!.rating ? "fill-current" : "text-slate-300")} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 text-right" dir="rtl">
                                        "{project.contractorReview.text}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Media Gallery Grid - Smaller */}
                    <div className="grid grid-cols-4 gap-1.5">
                        {project.media.slice(0, 4).map((item, idx) => (
                            <Dialog key={item.id}>
                                <DialogTrigger asChild>
                                    <button className="relative aspect-video sm:aspect-square rounded-md overflow-hidden cursor-pointer group bg-slate-100 ring-1 ring-slate-100 hover:ring-blue-400 transition-all outline-none p-0 w-full">
                                        <img src={item.thumbnail} alt="media" className="w-full h-full object-cover transition-transform group-hover:scale-105" />

                                        {/* Overlay for Video */}
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                                                    <Play className="w-3 h-3 fill-current ml-0.5" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Count Overlay */}
                                        {idx === 3 && project.media.length > 4 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs backdrop-blur-[1px]">
                                                +{project.media.length - 3}
                                            </div>
                                        )}
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
                                    <VisuallyHidden>
                                        <DialogTitle>نمایش رسانه پروژه</DialogTitle>
                                        <DialogDescription>
                                            نمایش تصویر یا ویدیو مربوط به پروژه {project.title}
                                        </DialogDescription>
                                    </VisuallyHidden>
                                    <div className="flex items-center justify-center w-full h-full">
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt="Full view" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain min-w-[300px]" />
                                        ) : (
                                            <video src={item.url} controls className="max-w-full max-h-[80vh] rounded-lg shadow-2xl min-w-[300px]" />
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
