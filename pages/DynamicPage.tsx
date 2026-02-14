import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import DOMPurify from 'dompurify';
import { StorySection, ValuesGrid, HeroSection, CtaSection, ContactSection, FaqContactSection } from '../components/PageBlocks';

interface Block {
    id: string;
    type: 'story_section' | 'values_grid' | 'rich_text' | 'hero_section' | 'cta_section' | 'contact_section' | 'faq_contact_section';
    data: any;
}

const DynamicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { pages, loading } = useStore();

    const page = useMemo(() => {
        if (!slug || !pages.length) return null;
        return pages.find(p => p.slug === slug);
    }, [slug, pages]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!page || !page.isPublished) {
        return <Navigate to="/" />;
    }

    // New Rendering Logic:
    // If it's legacy content (no JSON), wrap in standard container.
    // If it's JSON blocks, iterate and handle wrapping per block type.

    const isJsonContent = page.content.trim().startsWith('[');

    if (!isJsonContent) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-none shadow-sm p-8 md:p-12 mb-8 min-h-[50vh]">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">{page.title}</h1>
                        <div
                            className="prose prose-lg max-w-none prose-emerald"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    let blocks: Block[] = [];
    try {
        blocks = JSON.parse(page.content);
    } catch (e) {
        return <div className="p-12 text-center text-red-500">Error loading content</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Note: removed global padding. Blocks define their own. */}

            {blocks.map((block, index) => {
                if (block.type === 'hero_section') {
                    // Full Width Render
                    return (
                        <div key={block.id} className="w-full mb-12">
                            <HeroSection data={block.data} />
                        </div>
                    );
                } else {
                    // Containerized Render (White Card Style)
                    return (
                        <div key={block.id} className="container mx-auto px-4 mb-8">
                            <div className="bg-white rounded-none p-8 md:p-16 shadow-sm border border-gray-100/50">
                                {block.type === 'story_section' && <StorySection data={block.data} />}
                                {block.type === 'values_grid' && <ValuesGrid data={block.data} />}
                                {block.type === 'contact_section' && <ContactSection data={block.data} />}
                                {block.type === 'faq_contact_section' && <FaqContactSection data={block.data} />}
                                {block.type === 'cta_section' && <CtaSection data={block.data} />}
                                {block.type === 'rich_text' && (
                                    <div
                                        className="prose prose-lg max-w-none prose-emerald"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.data.content) }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                }
            })}
        </div>
    );
};

export default DynamicPage;
