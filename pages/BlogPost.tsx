import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { blogPosts } = useStore();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h2>
                <Link to="/blog" className="text-black hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Blog
                </Link>
            </div>
        );
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    };

    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Hero Section */}
            <div className="w-full h-[400px] relative">
                <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="container mx-auto px-4 text-center text-white">
                        <div className="inline-block bg-white text-black px-4 py-1 rounded-full text-sm font-semibold mb-4">
                            {post.tags[0]}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} />
                                <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={18} />
                                <span>By {post.author}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-3xl px-4 -mt-20 relative z-10">
                <div className="bg-white rounded-xl shadow-xl p-8 md:p-12">
                    {/* Share/Actions Header */}
                    <div className="flex items-center justify-between pb-8 border-b border-gray-100 mb-8">
                        <Link to="/blog" className="text-black hover:text-gray-600 flex items-center gap-2 text-sm font-medium transition-colors">
                            <ArrowLeft size={18} /> Back to Blog
                        </Link>
                        <button onClick={handleShare} className="text-black hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full" title="Share">
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg prose-emerald max-w-none text-gray-700">
                        <p className="lead text-xl text-gray-600 font-medium mb-8 italic">
                            {post.excerpt}
                        </p>
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    {/* Tags Footer */}
                    <div className="pt-8 border-t border-gray-100 mt-12">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, idx) => (
                                <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                                    <Tag size={14} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
