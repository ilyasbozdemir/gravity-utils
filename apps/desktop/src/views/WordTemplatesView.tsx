import React from 'react';
import { WordTemplateManager } from '@shared/index';

const WordTemplatesView: React.FC = () => {
    return (
        <div className="h-full w-full overflow-y-auto">
            <WordTemplateManager />
        </div>
    );
};

export default WordTemplatesView;
