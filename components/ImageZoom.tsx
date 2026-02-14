import React, { useState, useRef } from 'react';

interface ImageZoomProps {
    src: string;
    alt: string;
    className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className = '' }) => {
    const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
        backgroundImage: `url(${src})`,
        backgroundPosition: '0% 0%',
    });
    const [isHovered, setIsHovered] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;

        setZoomStyle({
            ...zoomStyle,
            backgroundImage: `url(${src})`, // Update url in case src changes
            backgroundPosition: `${x}% ${y}%`,
        });
    };

    return (
        <div
            className={`relative overflow-hidden cursor-crosshair group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`block w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'
                    }`}
            />
            {isHovered && (
                <div
                    className="absolute inset-0 w-full h-full pointer-events-none bg-no-repeat"
                    style={{
                        ...zoomStyle,
                        backgroundSize: '200%', // Zoom level (2x)
                    }}
                />
            )}
        </div>
    );
};

export default ImageZoom;
