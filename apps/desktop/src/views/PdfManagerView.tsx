import React from 'react';
import { PdfManager } from '@shared/index';
import { useNavigate } from 'react-router-dom';

const PdfManagerView: React.FC = () => {
    const navigate = useNavigate();
    return <PdfManager file={null} onBack={() => navigate('/')} />;
};

export default PdfManagerView;
