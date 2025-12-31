import React from 'react';
import ProjectCard from './ProjectCard';
import { mockProjects } from './mockData';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const ProjectShowcase: React.FC = () => {
    return (
        <section className="w-full py-16 bg-slate-50 dark:bg-slate-950" dir="rtl">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        نمونه‌کارها و تجربه همکاری کاربران
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        پروژه‌های واقعی، نظرات واقعی، شفافیت واقعی
                    </p>
                </div>

                <div className="relative px-4 sm:px-12">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {mockProjects.map((project) => (
                                <CarouselItem key={project.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2 xl:basis-1/2">
                                    <div className="p-1 h-full">
                                        <ProjectCard project={project} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -right-12" />
                        <CarouselNext className="hidden md:flex -left-12" />

                        {/* Mobile Navigation Controls (optional, standard ones might be off-screen on mobile) */}
                        <div className="flex md:hidden justify-center gap-4 mt-8">
                            <CarouselPrevious className="static translate-y-0 translate-x-0" />
                            <CarouselNext className="static translate-y-0 translate-x-0" />
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
};

export default ProjectShowcase;
