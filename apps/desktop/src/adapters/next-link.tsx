import React from 'react';
import { Link } from 'react-router-dom';

const NextLink = ({ href, children, className, onClick, ...props }: any) => {
    // If it's an external link
    if (href && (href.startsWith('http') || href.startsWith('mailto:'))) {
        return (
            <a href={href} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
            </a>
        );
    }

    // Internal link routing via View (since App uses hash views now, onClick mostly overrides it in Sidebar)
    return (
        <a href={`#${href}`} className={className} onClick={onClick} {...props}>
            {children}
        </a>
    );
};

export default NextLink;
