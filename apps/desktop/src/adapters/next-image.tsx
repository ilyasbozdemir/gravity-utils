import React from 'react';

const NextImage = ({ src, alt, width, height, className, ...props }: any) => {
    // Basic image wrapper for Vite desktop to not crash when mounting NextJS components that use next/image
    const imageSrc = typeof src === 'string' ? src : (src?.src || '');
    return (
        <img src={imageSrc} alt={alt || ''} width={width} height={height} className={className} {...props} />
    );
};

export default NextImage;
